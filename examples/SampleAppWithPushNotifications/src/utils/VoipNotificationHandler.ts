import {Platform} from 'react-native';
import notifee, {AndroidImportance, EventType} from '@notifee/react-native';
import RNCallKeep, {IOptions} from 'react-native-callkeep';
import {CometChat} from '@cometchat/chat-sdk-react-native';
import {navigate} from '../navigation/NavigationService'; // Adjust the path as necessary
import VoipPushNotification from 'react-native-voip-push-notification';

// Generate a unique UUID
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

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
    imageName: 'ic_notification',
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
  isRinging: boolean = false;
  isAnswered: boolean = false;
  callerId: string = '';
  msg: any = {};

  constructor() {
    this.initialize();
  }

  initialize() {
    this.getPermissions();
    if (Platform.OS === 'android') {
      this.createNotificationChannel();
    }
    this.setupEventListeners();
  }

  async getPermissions() {
    try {
      // Setup RNCallKeep
      await RNCallKeep.setup(options);
      RNCallKeep.setAvailable(true);
      RNCallKeep.setReachable();
      const hasPhoneAccount = await RNCallKeep.checkPhoneAccountEnabled();
    } catch (err) {
      console.error('[VoipNotificationHandler] Error in getPermissions:', err);
    }
  }

  async createNotificationChannel() {
    console.log('[VoipNotificationHandler] createNotificationChannel() called');
    try {
      this.channelId = await notifee.createChannel({
        id: 'message',
        name: 'Messages',
        lights: true,
        vibration: true,
        importance: AndroidImportance.HIGH,
      });
      console.log(
        '[VoipNotificationHandler] createNotificationChannel => channelId:',
        this.channelId,
      );
    } catch (error) {
      console.error(
        '[VoipNotificationHandler] Error in createNotificationChannel:',
        error,
      );
    }
  }

  // For Android: Display the incoming call UI using RNCallKeep.
  displayCallAndroid() {
    console.log(
      '[VoipNotificationHandler] displayCallAndroid() => isRinging:',
      this.isRinging,
      ' isAnswered:',
      this.isAnswered,
    );

    this.isRinging = true;
    this.callerId = generateUUID();

    if (this.msg) {
      console.log(
        '[VoipNotificationHandler] displayCallAndroid => Incoming call data:',
        this.msg,
      );
      RNCallKeep.displayIncomingCall(
        this.callerId,
        this.msg.senderName,
        this.msg.senderName,
        'generic',
      );
    } else {
      console.error(
        '[VoipNotificationHandler] displayCallAndroid => No call data found in this.msg!',
      );
    }
  }

  didDisplayIncomingCall(args: {callUUID?: string; error?: any}) {
    console.log(
      '[VoipNotificationHandler] didDisplayIncomingCall => args:',
      args,
    );
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

  removeCallDialerWithUUID = (callerId: string) => {
    console.log(
      '[VoipNotificationHandler] removeCallDialerWithUUID => callerId:',
      callerId,
    );
    const uuidToEnd = callerId || this.callerId;
    if (uuidToEnd) {
      RNCallKeep.reportEndCallWithUUID(uuidToEnd, 6);
    }
  };

  onAnswerCall = ({callUUID}: {callUUID: string}) => {
    console.log(
      '[VoipNotificationHandler] onAnswerCall => callUUID:',
      callUUID,
    );
    this.isRinging = false;
    RNCallKeep.backToForeground();

    const callInfo = this.msg;
    console.log(
      '[VoipNotificationHandler] onAnswerCall => callInfo:',
      callInfo,
    );

    setTimeout(() => {
      const sessionID = this.msg.sessionId;
      console.log(
        '[VoipNotificationHandler] onAnswerCall => sessionID:',
        sessionID,
      );
      if (sessionID) {
        CometChat.acceptCall(sessionID)
          .then(() => {
            console.log('[VoipNotificationHandler] acceptCall => success');
            this.isAnswered = true;
            if (Platform.OS === 'android') {
              RNCallKeep.endAllCalls();
            }
            navigate('OutgoingCallScreen', {call: this.msg});
          })
          .catch((error: any) => {
            console.error(
              '[VoipNotificationHandler] acceptCall => Error:',
              error,
            );
          });
      } else {
        console.error(
          '[VoipNotificationHandler] onAnswerCall => No session ID to accept call.',
        );
      }
    }, 1000);
  };

  removeCallDialer() {
    console.log(
      '[VoipNotificationHandler] removeCallDialer => ending all calls',
    );
    RNCallKeep.endAllCalls();
  }

  endCall = async ({callUUID}: {callUUID: string}) => {
    console.log('[VoipNotificationHandler] endCall => callUUID:', callUUID);
    if (this.msg?.type === 'call') {
      const sessionID = this.msg.sessionId;
      console.log(
        '[VoipNotificationHandler] endCall => sessionID:',
        sessionID,
        ' isAnswered:',
        this.isAnswered,
      );
      if (this.isAnswered && sessionID) {
        console.log('[VoipNotificationHandler] endCall => CometChat.endCall()');
        this.isAnswered = false;
        CometChat.endCall(sessionID);
      } else if (sessionID) {
        try {
          console.log(
            '[VoipNotificationHandler] endCall => CometChat.rejectCall()',
          );
          setTimeout(() => {
            CometChat.rejectCall(sessionID, CometChat.CALL_STATUS.REJECTED);
          }, 300);
        } catch (err) {
          console.error(
            '[VoipNotificationHandler] endCall => Error rejecting call:',
            err,
          );
        }
      }
    }

    const callIdToEnd = callUUID || this.callerId;
    if (callIdToEnd) {
      console.log(
        '[VoipNotificationHandler] endCall => Ending call with callId:',
        callIdToEnd,
      );
      RNCallKeep.endCall(callIdToEnd);
    }

    // Also just in case, end all
    RNCallKeep.endAllCalls();

    // Reset local state
    this.isRinging = false;
    this.isAnswered = false;
    this.callerId = '';
    this.msg = {};
  };

  async cancel(notificationId: any) {
    console.log(
      '[VoipNotificationHandler] cancel => notificationId:',
      notificationId,
    );
    await notifee.cancelNotification(
      notificationId || this.currentNotificationId,
    );
  }

  setupEventListeners() {
    console.log(
      '[VoipNotificationHandler] setupEventListeners => adding RNCallKeep & notifee listeners',
    );

    if (Platform.OS === 'ios') {
      // iOS: Foreground notifications
      notifee.onForegroundEvent(({type, detail}) => {
        console.log(
          '[VoipNotificationHandler] iOS onForegroundEvent => type:',
          type,
          ' detail:',
          detail,
        );
        if (type === EventType.PRESS || type === EventType.ACTION_PRESS) {
          const msg = detail.notification?.data;
          console.log(
            '[VoipNotificationHandler] iOS onForegroundEvent => msg:',
            msg,
          );
          if (msg) {
            this.msg = msg;
            // this.displayCallAndroid();
          }
        }
      });

      // If you are using react-native-voip-push-notification for iOS, you may also handle events there...
      VoipPushNotification.addEventListener(
        'notification',
        (notification: any) => {
          console.log(
            '[VoipNotificationHandler] iOS VoipPushNotification =>',
            notification,
          );
          this.msg = notification;
          // this.displayCallAndroid();
        },
      );
    }

    // CallKeep events for all platforms:
    RNCallKeep.addEventListener('answerCall', this.onAnswerCall);
    RNCallKeep.addEventListener('endCall', this.endCall);
    RNCallKeep.addEventListener(
      'didDisplayIncomingCall',
      this.didDisplayIncomingCall.bind(this),
    );
  }
}

// Export one shared instance to reuse everywhere
console.log('[VoipNotificationHandler] Creating global voipHandler instance');
export const voipHandler = new VoipNotificationHandler();

