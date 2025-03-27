import React, {useRef} from 'react';
import {CometChat} from '@cometchat/chat-sdk-react-native';
import {navigate} from '../../../navigation/NavigationService';
import {CometChatCalls} from '@cometchat/calls-sdk-react-native';
import {CometChatOngoingCall} from '@cometchat/chat-uikit-react-native';
import {voipHandler} from '../../../utils/VoipNotificationHandler';
import {SafeAreaView} from 'react-native-safe-area-context';

const OutgoingCallScreen = ({navigation, route}: any) => {
  const {call} = route.params;
  const isAudioCall = call.callType === 'audio';
  let sessionID = call.sessionId;

  const callListener = useRef<any>(null);
  const callSettings = useRef<any>(null);

  callListener.current = new CometChatCalls.OngoingCallListener({
    onCallEnded: () => {
      CometChat.clearActiveCall();
      CometChatCalls.endSession();
      navigate('BottomTabNavigator');
      voipHandler?.removeCallDialer();
    },
    onCallEndButtonPressed: () => {
      voipHandler?.removeCallDialer();
      CometChat.endCall((call as CometChat.Call).getSessionId());
      navigate('BottomTabNavigator');
    },
  });

  callSettings.current = new CometChatCalls.CallSettingsBuilder()
    .enableDefaultLayout(true)
    .setCallEventListener(callListener.current)
    .setIsAudioOnlyCall(isAudioCall);

  return (
    <SafeAreaView
      style={{
        height: '100%',
        width: '100%',
        position: 'relative',
      }}>
      <CometChatOngoingCall
        sessionID={sessionID}
        callSettingsBuilder={callSettings.current}
      />
    </SafeAreaView>
  );
};

export default OutgoingCallScreen;
