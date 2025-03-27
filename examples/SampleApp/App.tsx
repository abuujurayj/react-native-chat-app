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

import {SafeAreaProvider} from 'react-native-safe-area-context';
import {CometChat} from '@cometchat/chat-sdk-react-native';
import RootStackNavigator from './src/navigation/RootStackNavigator';
import {AppConstants} from './src/utils/AppConstants';
import {
  requestAndroidPermissions,
} from './src/utils/helper';
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
