import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import RNCallKeep
import PushKit
import UserNotifications
import RNCPushNotificationIOS

// Make sure you've properly bridged the RNVoipPushNotificationManager in your Swift Bridging Header
// #import "RNVoipPushNotificationManager.h"

@main
class AppDelegate: RCTAppDelegate, UNUserNotificationCenterDelegate, PKPushRegistryDelegate {

  // MARK: - ADD A PushKit Registry property
  private var pushRegistry: PKPushRegistry?

  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    self.moduleName = "sampleapp"
    self.dependencyProvider = RCTAppDependencyProvider()

    // ============================================
    // (Recommended) Register for VoIP right away
    // ============================================
    RNVoipPushNotificationManager.voipRegistration()

    // ============================================
    // Set up PushKit with desiredPushTypes = [.voIP]
    // ============================================
    pushRegistry = PKPushRegistry(queue: .main)
    pushRegistry?.delegate = self
    pushRegistry?.desiredPushTypes = [.voIP]

    // Setup user notifications center delegate
    UNUserNotificationCenter.current().delegate = self

    // You can add your custom initial props in the dictionary below.
    self.initialProps = [:]

    let superReturn = super.application(application, didFinishLaunchingWithOptions: launchOptions)
    return superReturn
  }

  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }

  // MARK: - Standard APNs Token Methods

  override func application(
    _ application: UIApplication,
    didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
  ) {
    // Forward token to RNCPushNotificationIOS
    RNCPushNotificationIOS.didRegisterForRemoteNotifications(withDeviceToken: deviceToken)
  }

  override func application(
    _ application: UIApplication,
    didFailToRegisterForRemoteNotificationsWithError error: Error
  ) {
    print("⚡️[AppDelegate] didFailToRegisterForRemoteNotificationsWithError => \(error)")
    // Forward error to RNCPushNotificationIOS
    RNCPushNotificationIOS.didFailToRegisterForRemoteNotificationsWithError(error)
  }

  override func application(
    _ application: UIApplication,
    didReceiveRemoteNotification userInfo: [AnyHashable : Any],
    fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void
  ) {
    // Forward notification to RNCPushNotificationIOS
    RNCPushNotificationIOS.didReceiveRemoteNotification(userInfo, fetchCompletionHandler: completionHandler)
  }

  // MARK: - UserNotificationCenter (for iOS 10+)

  @available(iOS 10.0, *)
  func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    didReceive response: UNNotificationResponse,
    withCompletionHandler completionHandler: @escaping () -> Void
  ) {
    RNCPushNotificationIOS.didReceive(response)
    completionHandler()
  }

  @available(iOS 10.0, *)
  func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    willPresent notification: UNNotification,
    withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
  ) {
    // Show the notification while in foreground
    completionHandler([.alert, .badge, .sound])
  }

  // MARK: - Handle CallKit for iOS 10+ (SiriKit etc.)
  override func application(
    _ application: UIApplication,
    continue userActivity: NSUserActivity,
    restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
  ) -> Bool {
    return RNCallKeep.application(application, continue: userActivity) {
      (restoredObjects: [Any]?) in
        restorationHandler(restoredObjects as? [UIUserActivityRestoring])
    }
  }

  // MARK: - PKPushRegistryDelegate (VoIP Token)

  func pushRegistry(
    _ registry: PKPushRegistry,
    didUpdate pushCredentials: PKPushCredentials,
    for type: PKPushType
  ) {
    guard type == .voIP else { return }
    let voipToken = pushCredentials.token.map { String(format: "%02x", $0) }.joined()
    // Let RN VoipPushNotificationManager know
    RNVoipPushNotificationManager.didUpdate(pushCredentials, forType: type.rawValue)
  }

  func pushRegistry(_ registry: PKPushRegistry, didInvalidatePushTokenFor type: PKPushType) {
    print("⚡️[AppDelegate] pushRegistry didInvalidatePushTokenFor => type: \(type)")
    print("VoIP Push Token invalidated.")
  }

  // MARK: - Handle incoming VoIP push
  func pushRegistry(
  _ registry: PKPushRegistry,
  didReceiveIncomingPushWith payload: PKPushPayload,
  for type: PKPushType,
  completion: @escaping () -> Void
) {
    // Only proceed with reporting the call if the app is not in the foreground.
    if UIApplication.shared.applicationState == .active {
        // If desired, you could still forward the push to your RN module here.
        completion()
        return
    }

    // Process the VoIP push only when the app is in background or killed.
    if type == .voIP {
        let payloadDict = payload.dictionaryPayload as? [String: Any] ?? [:]

        // --- Generate or retrieve the call UUID
        if AppDelegate.callUUID == nil {
            AppDelegate.callUUID = payloadDict["uuid"] as? String ?? UUID().uuidString
        }

        // --- Extract relevant fields from the payload
        let callAction = payloadDict["callAction"] as? String ?? ""
        let callerNameValue = payloadDict["senderName"] as? String
            ?? payloadDict["title"] as? String
            ?? "Unknown"
        let callerName = callerNameValue
        let handle = callerNameValue
        let hasVideo = (payloadDict["callType"] as? String) != "audio"

        // --- Add RNVoipPushNotificationManager completion handler
        RNVoipPushNotificationManager.addCompletionHandler(AppDelegate.callUUID, completionHandler: completion)

        // --- Forward the push payload to RNVoipPushNotificationManager
        RNVoipPushNotificationManager.didReceiveIncomingPush(with: payload, forType: type.rawValue)

        // --- Decide how to handle the call action
        if callAction == "initiated" {
            RNCallKeep.reportNewIncomingCall(
              AppDelegate.callUUID,
              handle: handle,
              handleType: "generic",
              hasVideo: hasVideo,
              localizedCallerName: callerName,
              supportsHolding: false,
              supportsDTMF: false,
              supportsGrouping: false,
              supportsUngrouping: false,
              fromPushKit: true,
              payload: nil
            )
        } else if callAction == "unanswered" {
            
            RNCallKeep.endCall(withUUID: AppDelegate.callUUID, reason: 3)
            AppDelegate.callUUID = nil
        } else if callAction == "rejected" {
            RNCallKeep.endCall(withUUID: AppDelegate.callUUID, reason: 6)
            AppDelegate.callUUID = nil
        } else if callAction == "busy" {
            RNCallKeep.endCall(withUUID: AppDelegate.callUUID, reason: 1)
            AppDelegate.callUUID = nil
        } else if callAction == "cancelled" {
            RNCallKeep.endCall(withUUID: AppDelegate.callUUID, reason: 6)
            AppDelegate.callUUID = nil
        } else if callAction == "ended" {
            RNCallKeep.endCall(withUUID: AppDelegate.callUUID, reason: 2)
            AppDelegate.callUUID = nil
        } else {
            RNCallKeep.endCall(withUUID: AppDelegate.callUUID, reason: 3)
            AppDelegate.callUUID = nil
        }
    } else {
        completion()
    }
}

}

// MARK: - Static UUID Storage
extension AppDelegate {
  static var callUUID: String?
}

