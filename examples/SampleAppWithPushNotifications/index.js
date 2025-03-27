import {AppRegistry, AppState, Platform} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import {name as appName} from './app.json';
import {voipHandler} from './src/utils/VoipNotificationHandler';
import {CometChat} from '@cometchat/chat-sdk-react-native';
import {navigate, navigationRef} from './src/navigation/NavigationService';
import {displayLocalNotification} from './src/utils/helper';
import notifee, {EventType} from '@notifee/react-native';
import {StackActions} from '@react-navigation/native';
import AppErrorBoundary from './AppErrorBoundary';
import { ActiveChatProvider } from './src/utils/ActiveChatContext';

if (global?.ErrorUtils) {
  const defaultHandler = global.ErrorUtils.getGlobalHandler();

  function globalErrorHandler(error, isFatal) {
    console.log(
      '[GlobalErrorHandler]:',
      isFatal ? 'Fatal:' : 'Non-Fatal:',
      error,
    );
    defaultHandler?.(error, isFatal);
  }

  global.ErrorUtils.setGlobalHandler(globalErrorHandler);
}

if (typeof process === 'object' && process.on) {
  process.on('unhandledRejection', (reason, promise) => {
    console.log('[Unhandled Promise Rejection]:', reason);
  });
}

const Root = () => (
  <AppErrorBoundary>
    <ActiveChatProvider>
      <App />
    </ActiveChatProvider>
  </AppErrorBoundary>
);

if (Platform.OS === 'android') {
notifee.onBackgroundEvent(async ({type, detail}) => {
  const {notification, pressAction} = detail;

  // If the user pressed the main body of the notification
  try {
    if (type === EventType.ACTION_PRESS && pressAction.id === 'default') {
      // Remove just the tapped notification
      // await notifee.cancelNotification(notification.id);
      // Or remove all if you prefer:
      try {
        await notifee.cancelAllNotifications();
      } catch (error) {
        console.error('Error clearing notifications:', error);
      }
    }
  } catch (error) {
    console.error('Error in background message handler:', error);
  }
});
}

const handleNavigation = (screen, params) => {
  console.log('AppState.currentState', AppState.currentState);
  if (AppState.currentState === 'background') {
    console.log(
      '🚀 ~ handleNavigation ~ navigationRef.isReady():',
      navigationRef.isReady(),
    );
    navigationRef.isReady()
      ? [
          console.log(
            '🚀 ~ handleNavigation ~ navigationRef.isReady():',
            navigationRef.isReady(),
          ),
          navigationRef.dispatch(StackActions.push(screen, params)),
        ]
      : [
          console.log(
            '🚀 ~ handleNavigation ~ navigationRef.isReady():',
            navigationRef.isReady(),
          ),
          navigate(screen, params),
        ];
  }
};
// This runs for background/killed states on Android.
if (Platform.OS === 'android') {
messaging().setBackgroundMessageHandler(async remoteMessage => {
  try {
    const data = remoteMessage.data || {};

    if (data && data.type === 'chat') {
      if (data.receiverType === 'group') {
        // Fetch Group details
        CometChat.getGroup(data?.receiver).then(
          group => {
            handleNavigation('BottomTabNavigator', {
              screen: 'Chats',
              params: {
                screen: 'Messages',
                params: {group},
              },
            });
          },
          error => console.log('Error fetching group details:', error),
        );
      } else if (data.receiverType === 'user') {
        CometChat.getUser(data?.sender).then(
          user => {
            handleNavigation('BottomTabNavigator', {
              screen: 'Chats',
              params: {
                screen: 'Messages',
                params: {user},
              },
            });
          },
          error => console.log('Error fetching user details:', error),
        );
      }
    }
    if (data.type === 'call') {
      switch (data.callAction) {
        case 'initiated':
          voipHandler.msg = data;
          voipHandler.displayCallAndroid();
          break;
        case 'ended':
          CometChat.clearActiveCall();
          voipHandler.endCall(voipHandler.callerId);
          break;
        case 'unanswered':
          CometChat.clearActiveCall();
          if (voipHandler?.callerId) {
            voipHandler.removeCallDialerWithUUID(voipHandler.callerId);
          } else {
            console.warn('Caller ID is missing. Cannot remove call dialer.');
          }
          break;
        case 'busy':
          CometChat.clearActiveCall();
          if (voipHandler?.callerId) {
            voipHandler.removeCallDialerWithUUID(voipHandler.callerId);
          } else {
            console.warn('Caller ID is missing. Cannot remove call dialer.');
          }
          break;
        case 'ongoing':
          voipHandler.displayNotification({
            title: data?.receiverName || '',
            body: 'ongoing call',
          });
          break;
        case 'rejected':
          CometChat.clearActiveCall();
          if (voipHandler?.callerId) {
            voipHandler.removeCallDialerWithUUID(voipHandler.callerId);
          } else {
            console.warn('Caller ID is missing. Cannot remove call dialer.');
          }
          break;
        case 'cancelled':
          CometChat.clearActiveCall();
          if (voipHandler?.callerId) {
            voipHandler.removeCallDialerWithUUID(voipHandler.callerId);
          } else {
            console.warn('Caller ID is missing. Cannot remove call dialer.');
          }
          break;
        default:
          break;
      }
      return;
    } else {
      await displayLocalNotification(remoteMessage);
    }
  } catch (error) {
    console.error('Error in background message handler:', error);
  }
});
}

AppRegistry.registerComponent(appName, () => Root);
