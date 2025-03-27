import './gesture-handler';
import React, {useState, useEffect, useRef} from 'react';
import {
  Platform,
  View,
  PlatformColor,
  AppState,
  AppStateStatus,
} from 'react-native';

import {
  CometChatIncomingCall,
  CometChatThemeProvider,
  CometChatUIEventHandler,
  CometChatUIEvents,
  CometChatUIKit,
  UIKitSettings,
} from '@cometchat/chat-uikit-react-native';

import messaging from '@react-native-firebase/messaging';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {CometChat} from '@cometchat/chat-sdk-react-native';
import RootStackNavigator from './src/navigation/RootStackNavigator';
import {AppConstants} from './src/utils/AppConstants';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import VoipPushNotification from 'react-native-voip-push-notification';
import {
  displayLocalNotification,
  requestAndroidPermissions,
  checkInitialNotificationIOS,
  onRemoteNotificationIOS,
  getAndRegisterFCMToken,
  handleIosApnsToken,
  handleIosVoipToken,
} from './src/utils/helper';
import {registerPushToken} from './src/utils/PushNotification';
import {voipHandler} from './src/utils/VoipNotificationHandler';
import {navigationRef} from './src/navigation/NavigationService';
import notifee, {EventType} from '@notifee/react-native';
import {StackActions} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useActiveChat} from './src/utils/ActiveChatContext';

const listenerId = 'app';

const App = (): React.ReactElement => {
  const {activeChat} = useActiveChat();
  const [callReceived, setCallReceived] = useState(false);
  const incomingCall = useRef<CometChat.Call | CometChat.CustomMessage | null>(
    null,
  );
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [currentToken, setCurrentToken] = useState('');
  const [isTokenRegistered, setIsTokenRegistered] = useState(false);

  /**
   * 1. Initial CometChat + UIKit Initialization
   */
  useEffect(() => {
    async function init() {
      try {
        const AppData = (await AsyncStorage.getItem('appCredentials')) || '{}';
        await CometChatUIKit.init({
          appId: JSON.parse(AppData).appId || AppConstants.appId,
          authKey: JSON.parse(AppData).authKey || AppConstants.authKey,
          region: JSON.parse(AppData).region || AppConstants.region,
          subscriptionType: CometChat.AppSettings
            .SUBSCRIPTION_TYPE_ALL_USERS as UIKitSettings['subscriptionType'],
        });

        const loggedInUser = CometChatUIKit.loggedInUser;
        if (loggedInUser) {
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.log('CometChat init or getLoggedinUser failed:', error);
      } finally {
        setIsInitializing(false);
      }
    }
    init();
  }, []);

  /**
   * 2. Re-check user & possibly re-init or re-login if app resumes
   */
  useEffect(() => {
    const handleAppStateChange = async (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        if (Platform.OS === 'android') {
          await notifee.cancelAllNotifications(); //clear all notifications
        }
        try {
          // Check if CometChat still has a valid logged in user
          const chatUser = await CometChat.getLoggedinUser();
          if (!chatUser) {
            setIsLoggedIn(false);
          } else {
            setIsLoggedIn(true);
          }
        } catch (error) {
          console.log('Error verifying CometChat user on resume:', error);
        }
      }
    };
    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );
    return () => subscription.remove();
  }, []);

  /**
   * 3. Handle inbound FCM messages in the foreground (Android).
   */
  useEffect(() => {
    if (Platform.OS === 'android') {
      requestAndroidPermissions();
      const unsubscribe = messaging().onMessage(async remoteMessage => {
        try {
          await displayLocalNotification(remoteMessage, activeChat);
        } catch (error) {
          console.log('Error displaying local notification:', error);
        }
      });
      return () => unsubscribe();
    }
  }, [activeChat]);

  /**
   * 4. Attach CometChatLogin Listener and Call Listener
   */
  useEffect(() => {
    // Login Listener
    CometChat.addLoginListener(
      listenerId,
      new CometChat.LoginListener({
        loginSuccess: () => {
          setUserLoggedIn(true);
        },
        loginFailure: (e: CometChat.CometChatException) => {
          console.log('LoginListener :: loginFailure', e.message);
        },
        logoutSuccess: () => {
          setUserLoggedIn(false);
          setIsTokenRegistered(false);
        },
        logoutFailure: (e: CometChat.CometChatException) => {
          console.log('LoginListener :: logoutFailure', e.message);
        },
      }),
    );

    return () => {
      // Clean up CometChat listeners
      CometChat.removeLoginListener(listenerId);
    };
  }, []);

  useEffect(() => {
    // Call Listener
    CometChat.addCallListener(
      listenerId,
      new CometChat.CallListener({
        onIncomingCallReceived: (call: CometChat.Call) => {
          // Close bottomsheet for incoming call overlay
          CometChatUIEventHandler.emitUIEvent(
            CometChatUIEvents.ccToggleBottomSheet,
            {
              isBottomSheetVisible: false,
            },
          );
          incomingCall.current = call;
          setCallReceived(true);
        },
        onOutgoingCallRejected: () => {
          incomingCall.current = null;
          setCallReceived(false);
        },
        onIncomingCallCancelled: () => {
          incomingCall.current = null;
          setCallReceived(false);
        },
      }),
    );

    CometChatUIEventHandler.addCallListener(listenerId, {
      ccCallEnded: () => {
        incomingCall.current = null;
        setCallReceived(false);
      },
    });

    return () => {
      // Clean up CometChat listeners
      CometChatUIEventHandler.removeCallListener(listenerId);
      CometChat.removeCallListener(listenerId);
    };
  }, [userLoggedIn]);

  /**
   * 5. iOS: Listen for tapped push notifications (background/foreground)
   */
  useEffect(() => {
    if (Platform.OS === 'ios') {
      checkInitialNotificationIOS();
      const onNotification = async (notification: any) => {
        try {
          await onRemoteNotificationIOS(notification);
        } catch (error) {
          console.log('Error in onRemoteNotificationIOS:', error);
        }
      };
      PushNotificationIOS.addEventListener('notification', onNotification);

      return () => {
        PushNotificationIOS.removeEventListener('notification');
      };
    }
  }, []);

  /**
   * 6. Listen to Notifee's onForegroundEvent for custom navigation
   */
  useEffect(() => {
    if (Platform.OS === 'android') {
    const unsubscribeNotifee = notifee.onForegroundEvent(({type, detail}) => {
      try {
        if (type === EventType.PRESS) {
          const {notification} = detail;
          if (notification?.id) {
            notifee.cancelNotification(notification.id);
          }
          const data = detail?.notification?.data || {};
          if (data.receiverType === 'group') {
            const extractedId =
              typeof data.conversationId === 'string'
                ? data.conversationId.split('_').slice(1).join('_')
                : '';
            CometChat.getGroup(extractedId).then(
              group => {
                navigationRef.current?.dispatch(
                  StackActions.push('Messages', {group}),
                );
              },
              error => console.log('Error fetching group details:', error),
            );
          } else if (data.receiverType === 'user') {
            CometChat.getUser(data.sender).then(
              ccUser => {
                navigationRef.current?.dispatch(
                  StackActions.push('Messages', {user: ccUser}),
                );
              },
              error => console.log('Error fetching user details:', error),
            );
          }
        }
      } catch (error) {
        console.log('Error handling notifee foreground event:', error);
      }
    });
    return () => unsubscribeNotifee();
  }
  }, []);

  /**
   * 7. Initialize VoIP handler after user logs in
   */
  useEffect(() => {
    try {
      if (Platform.OS === 'ios') {
        voipHandler.initialize();
      } else if (Platform.OS === 'android' && userLoggedIn) {
        const timer = setTimeout(() => {
          voipHandler.initialize();
        }, 3000);
        return () => clearTimeout(timer);
      }
    } catch (error) {
      console.log('Error initializing VoIP handler:', error);
    }
  }, [userLoggedIn]);

  /**
   * 8. iOS APNs token registration + VoIP token
   */
  useEffect(() => {
    if (Platform.OS === 'ios') {
      // Request iOS push permissions
      PushNotificationIOS.requestPermissions()
        .then(data => {
          console.log('PushNotificationIOS.requestPermissions:', data);
        })
        .catch(error => {
          console.error('PushNotificationIOS.requestPermissions error:', error);
        });

      // Handle the APNs token
      const handleApnsToken = async (deviceToken: string) => {
        try {
          console.log('iOS Device (APNs) Token:', deviceToken);
          VoipPushNotification.registerVoipToken();
          await handleIosApnsToken(
            userLoggedIn,
            deviceToken,
            currentToken,
            isTokenRegistered,
            setCurrentToken,
            setIsTokenRegistered,
          );
        } catch (err) {
          console.log('Error handling APNs token:', err);
        }
      };

      PushNotificationIOS.addEventListener('register', handleApnsToken);

      return () => {
        PushNotificationIOS.removeEventListener('register');
      };
    }
  }, [userLoggedIn, currentToken, isTokenRegistered]);

  /**
   * 9. iOS: Listen for VoIP token registration
   */
  useEffect(() => {
    if (Platform.OS === 'ios') {
      VoipPushNotification.addEventListener(
        'register',
        async (voipToken: string) => {
          try {
            console.log('VoIP Token:', voipToken);
            await handleIosVoipToken(userLoggedIn, voipToken);
          } catch (error) {
            console.log('Error handling VoIP token:', error);
          }
        },
      );
      return () => {
        VoipPushNotification.removeEventListener('register');
      };
    }
  }, [userLoggedIn]);

  /**
   * 10. Android: Listen for FCM token refreshes + register with CometChat
   */
  useEffect(() => {
    if (Platform.OS === 'android') {
      const unsubscribeOnTokenRefresh = messaging().onTokenRefresh(
        async newToken => {
          try {
            console.log('FCM Token refreshed:', newToken);
            if (
              userLoggedIn &&
              newToken !== currentToken &&
              !isTokenRegistered
            ) {
              await registerPushToken(newToken, true, false);
              console.log('New token registered with CometChat (FCM).');
              setCurrentToken(newToken);
              setIsTokenRegistered(true);
            }
          } catch (error) {
            console.error(
              'Failed to register new token with CometChat:',
              error,
            );
          }
        },
      );
      return () => unsubscribeOnTokenRefresh();
    }
  }, [userLoggedIn, currentToken, isTokenRegistered]);

  /**
   * 11. Android only: Trigger initial FCM token retrieval after user logs in
   */
  useEffect(() => {
    if (Platform.OS === 'android' && userLoggedIn && !isTokenRegistered) {
      const timer = setTimeout(() => {
        getAndRegisterFCMToken(
          userLoggedIn,
          currentToken,
          isTokenRegistered,
          setIsTokenRegistered,
          setCurrentToken,
        );
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [userLoggedIn, isTokenRegistered, currentToken]);

  // Show basic splash or blank screen while initializing
  if (isInitializing) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Platform.select({
            ios: PlatformColor('systemBackgroundColor'),
            android: PlatformColor('?android:attr/colorBackground'),
          }),
        }}
      />
    );
  }

  return (
    <SafeAreaProvider>
      <CometChatThemeProvider>
        {/* Only show incoming call UI if logged in + we have a call object */}
        {isLoggedIn && callReceived && incomingCall.current ? (
          <CometChatIncomingCall
            call={incomingCall.current}
            onDecline={() => {
              incomingCall.current = null;
              setCallReceived(false);
            }}
          />
        ) : null}
        {/* Pass isLoggedIn to your main stack */}
        <RootStackNavigator isLoggedIn={isLoggedIn} />
      </CometChatThemeProvider>
    </SafeAreaProvider>
  );
};

export default App;
