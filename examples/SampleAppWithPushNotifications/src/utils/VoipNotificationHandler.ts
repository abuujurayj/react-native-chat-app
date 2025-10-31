import { Platform } from 'react-native';
import notifee, { AndroidImportance } from '@notifee/react-native';
import RNCallKeep, { IOptions } from 'react-native-callkeep';
import { CometChat } from '@cometchat/chat-sdk-react-native';
import { navigate, navigationRef } from '../navigation/NavigationService';
import { setPendingAnsweredCall } from './PendingCallManager';
import VoipPushNotification from 'react-native-voip-push-notification';

/**
 * Generate a unique UUID (Universally Unique Identifier).
 * This will be used, for example, as a 'callUUID' in RNCallKeep so it can track calls.
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Configuration options for RNCallKeep (for both iOS and Android).
 * This is mostly about setting up how the app handles calls natively on each platform.
 */
const options: IOptions = {
  ios: {
    appName: 'Sampleapp',
  },
  android: {
    alertTitle: 'VOIP required',
    alertDescription:
      'This application needs to access your phone accounts to make calls',
    cancelButton: 'Cancel',
    okButton: 'OK',
    imageName: 'ic_notification', // For Android notifications
    additionalPermissions: [],
    foregroundService: {
      channelId: 'com.cometchat.sampleapp.reactnative.android',
      channelName: 'Sampleapp Channel',
      notificationTitle: 'Sampleapp is running in the background',
    },
  },
};

export class VoipNotificationHandler {
  channelId: string = '';
  currentNotificationId: string = '';
  // Whether the phone is currently 'ringing'
  isRinging: boolean = false;
  // Whether the call has been answered
  isAnswered: boolean = false;
  // Whether call acceptance is deferred waiting for login/navigation
  pendingAcceptance: boolean = false;
  // UUID of the caller
  callerId: string = '';
  // Object that holds data about the incoming message/call
  msg: any = {};
  // initialization guard
  initialized: boolean = false;
  // ensures setup only runs once per process
  private setupPromise: Promise<void> | null = null;
  // prevents attaching duplicate listeners after reloads
  private listenersAttached: boolean = false;

  constructor() {
    // Lazy initialization; explicit initialize() will be called from App once environment ready.
  }

  /**
   * The main initialization function that sets up:
   *  - RNCallKeep permissions
   *  - The Notifee channel (on Android)
   *  - Event listeners for incoming calls and actions
   */
  async initialize(): Promise<void> {
    if (this.initialized && this.setupPromise) {
      await this.setupPromise;
      return;
    }

    if (!this.setupPromise) {
      this.setupPromise = (async () => {
        if (Platform.OS === 'android') {
          await this.createNotificationChannel();
        }
        await this.getPermissions();
        this.setupEventListeners();
        this.initialized = true;
      })().catch(error => {
        this.setupPromise = null;
        throw error;
      });
    }

    await this.setupPromise;
  }

  /**
   * Request permissions and set up RNCallKeep for handling calls.
   * - On iOS, checks/requests permission to show native call UI.
   * - On Android, sets up phone account if needed.
   */
  async getPermissions() {
    try {
      // Setup RNCallKeep using the provided options
      await RNCallKeep.setup(options);
      // Mark the device as available and reachable for calls
      RNCallKeep.setAvailable(true);
      RNCallKeep.setReachable();
      // Check if a phone account is enabled (Android-specific)
      try {
        await RNCallKeep.checkPhoneAccountEnabled();
      } catch (err) {
        console.log(
          '[CallKeep] Phone account not enabled yet, will retry later.',
        );
      }
    } catch (err) {
      console.error('[VoipNotificationHandler] Error in getPermissions:', err);
    }
  }

  /**
   * Create a Notifee notification channel on Android
   * so that notifications have the correct importance level (HIGH),
   * vibration, lights, etc.
   */
  async createNotificationChannel() {
    try {
      this.channelId = await notifee.createChannel({
        id: 'message',
        name: 'Messages',
        lights: true,
        vibration: true,
        importance: AndroidImportance.HIGH,
      });
    } catch (error) {
      console.error(
        '[VoipNotificationHandler] Error in createNotificationChannel:',
        error,
      );
    }
  }

  /**
   * Display the native incoming call screen on Android using RNCallKeep.
   * - Called when an incoming call notification is received.
   */
  async displayCallAndroid(): Promise<void> {
    if (this.isAnswered || this.pendingAcceptance) {
      console.log(
        '[VoipNotificationHandler] Skipping displayCallAndroid - already answered or pending acceptance',
      );
      return;
    }

    try {
      await this.initialize();
    } catch (error) {
      console.error(
        '[VoipNotificationHandler] Failed to initialize before displaying call:',
        error,
      );
    }

    this.isRinging = true;
    this.callerId = generateUUID();

    if (this.msg) {
      const callerName =
        typeof this.msg.senderName === 'string' && this.msg.senderName.trim()
          ? this.msg.senderName
          : 'Incoming Call';
      // Display the incoming call UI with the caller's name
      try {
        await RNCallKeep.displayIncomingCall(
          this.callerId,
          callerName,
          callerName,
          'generic',
        );
      } catch (error) {
        this.isRinging = false;
        console.error(
          '[VoipNotificationHandler] displayCallAndroid => displayIncomingCall failed:',
          error,
        );
        throw error;
      }
    } else {
      console.error(
        '[VoipNotificationHandler] displayCallAndroid => No call data found in this.msg!',
      );
      this.isRinging = false;
    }
  }

  /**
   * Callback function for 'didDisplayIncomingCall' event (iOS only),
   * which is fired when the native iOS call screen is displayed.
   * - This sets the internal callerId if provided by iOS,
   *   and marks that we are indeed ringing.
   */
  didDisplayIncomingCall(args: { callUUID?: string; error?: any }) {
    if (args.callUUID && Platform.OS === 'ios') {
      this.callerId = args.callUUID;
    }
    if (args.error) {
      console.error(
        '[VoipNotificationHandler] didDisplayIncomingCall error =>',
        args.error,
      );
    }
    this.isRinging = true;
  }

  /**
   * Ends the call with a given UUID (or fallback to our stored callerId).
   * - This is typically used when we manually want to remove the dialer UI.
   */
  removeCallDialerWithUUID = (callerId: string) => {
    const uuidToEnd = callerId || this.callerId;
    if (uuidToEnd) {
      // 6 -> Call hung up
      RNCallKeep.reportEndCallWithUUID(uuidToEnd, 6);
    }
  };

  /**
   * Handles the 'answerCall' event from RNCallKeep.
   * - When the user answers the call on the native call screen,
   *   bring the app to the foreground, accept the call via CometChat,
   *   and then navigate to our 'OngoingCallScreen'.
   */
  onAnswerCall = async ({ callUUID }: { callUUID: string }) => {
    if (this.isAnswered) {
      return; // Avoid double-answer
    }

    this.isRinging = false;
    this.isAnswered = true;

    const sessionID = this.msg?.sessionId;
    if (!sessionID) {
      console.error(
        '[VoipNotificationHandler] onAnswerCall => No session ID to accept call.',
      );
      return;
    }

    // Defer logic slightly so app/root initialization (cold start) can happen
    setTimeout(async () => {
      try {
        // If there is no logged in user yet OR navigation not ready, stash for later.
        const loggedInUser = await CometChat.getLoggedinUser().catch(
          () => null,
        );
        if (!loggedInUser || !navigationRef.isReady()) {
          console.log(
            '[VoipNotificationHandler] Deferring call acceptance until login/navigation ready',
          );
          this.pendingAcceptance = true;
          await setPendingAnsweredCall({
            sessionId: sessionID,
            raw: this.msg,
            storedAt: Date.now(),
          });
          // Bring app foreground anyway
          RNCallKeep.backToForeground();
          return;
        }

        let acceptedCall: any = null;
        try {
          acceptedCall = await CometChat.acceptCall(sessionID);
          console.log('[VoipNotificationHandler] acceptCall => success');
        } catch (error: any) {
          if (error?.code === 'ERR_CALL_USER_ALREADY_JOINED') {
            console.log(
              '[VoipNotificationHandler] Already joined; using active call',
            );
            acceptedCall = CometChat.getActiveCall();
          } else {
            throw error;
          }
        }

        if (Platform.OS === 'android') {
          RNCallKeep.endAllCalls();
        }
        
        const active = acceptedCall || CometChat.getActiveCall();
        const callTypeForNav =
          (typeof active?.getType === 'function'
            ? active.getType()
            : undefined) ??
          (this.msg?.callType as any) ??
          (this.msg?.type as any);

        navigate('OngoingCallScreen', {
          sessionId: sessionID,
          callType: callTypeForNav,
        });
      } catch (error: any) {
        console.error(
          '[VoipNotificationHandler] Accept call error (deferred path):',
          error,
        );
      } finally {
        RNCallKeep.backToForeground();
        this.pendingAcceptance = false;
      }
    }, 600); // shorter delay – rely on deferral if not ready
  };

  /**
   * Convenience method to end all calls on the dialer UI immediately.
   */
  removeCallDialer() {
    RNCallKeep.endAllCalls();
  }

  endCall = async ({ callUUID }: { callUUID: string }) => {
    if (this.msg?.type === 'call') {
      const sessionID = this.msg.sessionId;
      if (this.isAnswered && sessionID) {
        this.isAnswered = false;
        CometChat.endCall(sessionID);
      } else if (sessionID) {
        try {
          const loggedInUser = await CometChat.getLoggedinUser().catch(
            () => null,
          );
          if (loggedInUser) {
            setTimeout(() => {
              CometChat.rejectCall(sessionID, CometChat.CALL_STATUS.REJECTED);
            }, 300);
          } else {
            console.log(
              '[VoipNotificationHandler] Skipping rejectCall: user not logged in (likely cold start)',
            );
          }
        } catch (err) {
          console.error(
            '[VoipNotificationHandler] endCall => Error handling rejection logic:',
            err,
          );
        }
      }
    }

    const callIdToEnd = callUUID || this.callerId;
    if (callIdToEnd) {
      RNCallKeep.endCall(callIdToEnd);
    }
    RNCallKeep.endAllCalls();
    this.isRinging = false;
    this.isAnswered = false;
    this.pendingAcceptance = false;
    this.callerId = '';
    this.msg = {};
  };

  /**
   * Cancel the Notifee notification if one is shown.
   * - Typically used if you have a custom notification that
   *   you need to cancel for an incoming call.
   */
  async cancel(notificationId: any) {
    await notifee.cancelNotification(
      notificationId || this.currentNotificationId,
    );
  }

  /**
   * Set up various event listeners for incoming VOIP push notifications
   * (on iOS) and for RNCallKeep (on both iOS and Android).
   */
  setupEventListeners() {
    if (this.listenersAttached) {
      return;
    }

    // For iOS VOIP push notifications
    if (Platform.OS === 'ios') {
      VoipPushNotification.addEventListener(
        'notification',
        (notification: any) => {
          // Store the call data
          console.log(
            '[VoipNotificationHandler] Received VOIP push notification:',
            notification,
          );
          this.msg = notification;
        },
      );

      VoipPushNotification.addEventListener('didLoadWithEvents', events => {
        if (!events || !Array.isArray(events) || events.length < 1) {
          return;
        }
        for (let voipPushEvent of events) {
          let { name, data } = voipPushEvent;
          if (
            name ===
            VoipPushNotification.RNVoipPushRemoteNotificationReceivedEvent
          ) {
            this.msg = data;
          }
        }
      });
    }

    // RNCallKeep events for all platforms
    RNCallKeep.addEventListener('answerCall', this.onAnswerCall);
    RNCallKeep.addEventListener('endCall', this.endCall);
    RNCallKeep.addEventListener(
      'didDisplayIncomingCall',
      this.didDisplayIncomingCall.bind(this),
    );

    this.listenersAttached = true;
  }
}

// Export a single instance of VoipNotificationHandler to be reused
export const voipHandler = new VoipNotificationHandler();