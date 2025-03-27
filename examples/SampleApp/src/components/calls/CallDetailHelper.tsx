import {CometChatUIKit} from '@cometchat/chat-uikit-react-native';
import {
  CallEnd,
  CallEndFill,
  CallMade,
  CallMissedFill,
  CallMissedOutgoingFill,
  CallReceived,
  CancelFill,
} from './icons';
import {SvgProps} from 'react-native-svg';
import {CometChatTheme} from '@cometchat/chat-uikit-react-native/src/theme/type';

export class CallDetailHelper {
  // static callStatusIcon = {
  //   // outgoing: <CallEndFill height={24} width={24} color="red" />,
  //   // incoming: <CallEndFill height={24} width={24} color="red" />,
  //   // unansweredByThem: (
  //   //   <CallMissedOutgoingFill height={24} width={24} color="red" />
  //   // ),
  //   // unansweredByMe: <CallMissedFill height={24} width={24} color="red" />,
  //   // cancelled: <CancelFill height={24} width={24} color="red" />,
  //   // incomingRejected: <CallMade height={24} width={24} color="red" />,
  //   // outgoingRejected: <CallEnd height={24} width={24} color="red" />,
  //   // incomingCallEnded: <CallReceived height={24} width={24} color="green" />,
  //   // outgoingCallEnded: <CallMade height={24} width={24} color="red" />,

  //   outgoing: <CallMade height={24} width={24} color="green" />,
  //   outgoingCallEnded: <CallMade height={24} width={24} color="green" />,
  //   cancelledByMe: <CallMade height={24} width={24} color="green" />,
  //   outgoingRejected: <CallMade height={24} width={24} color="red" />,
  //   //busy pending     busy: <CallMade height={24} width={24} color="red" />
  //   unansweredByThem: <CallMissedOutgoingFill height={24} width={24} color="red" />,

  //   incoming: <CallReceived height={24} width={24} color="green" />,
  //   incomingCallEnded: <CallReceived height={24} width={24} color="green" />,
  //   cancelledByThem: <CallReceived height={24} width={24} color="red" />,
  //   incomingRejected: <CallReceived height={24} width={24} color="red" />,
  //   //busy pending     busy: <CallReceived height={24} width={24} color="red" />,
  //   unansweredByMe: <CallMissedFill height={24} width={24} color="red" />,
  // } as const;

  // static callStatusIcon = {
  //   outgoing: <CallMade height={24} width={24} color="green" />,
  //   outgoingCallEnded: <CallMade height={24} width={24} color="green" />,
  //   cancelledByMe: <CallMade height={24} width={24} color="green" />,
  //   outgoingRejected: <CallMade height={24} width={24} color="green" />,
  //   //busy pending     busy: <CallMade height={24} width={24} color="red" />
  //   unansweredByThem: <CallMade height={24} width={24} color="green" />,

  //   incoming: <CallReceived height={24} width={24} color="green" />,
  //   incomingCallEnded: <CallReceived height={24} width={24} color="green" />,
  //   cancelledByThem: <CallReceived height={24} width={24} color="red" />,
  //   incomingRejected: <CallReceived height={24} width={24} color="red" />,
  //   //busy pending     busy: <CallReceived height={24} width={24} color="red" />,
  //   unansweredByMe: <CallReceived height={24} width={24} color="red" />,
  // } as const;

  static getFormattedInitiatedAt = (call: any) => {
    const timestamp = call.getInitiatedAt();
    const date = new Date(timestamp * 1000); // Convert to milliseconds
    const now = new Date();

    // Extracting parts
    const day = date.getDate();
    const month = new Intl.DateTimeFormat('en-US', {month: 'long'}).format(
      date,
    );
    const year = date.getFullYear();
    const time = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    // Determine if the year should be included
    const includeYear = now.getFullYear() !== year;

    return `${day} ${month}${includeYear ? `, ${year}` : ''}, ${time}`;
  };

  static getCallType = (
    call: any,
  ): {
    type: string;
    callStatus: string;
  } => {
    let type = '';
    let callStatus!: string;
    if (call.getInitiator().getUid() === CometChatUIKit.loggedInUser!.getUid()) {
      type = 'outgoing';
    }
    if (call.getInitiator().getUid() !== CometChatUIKit.loggedInUser!.getUid()) {
      type = 'incoming';
    }
    if (call.getStatus() === 'ended') {
      if (type == 'incoming') {
        callStatus = 'incomingCallEnded';
      } else {
        callStatus = 'outgoingCallEnded';
      }
    } else if (call.getStatus() === 'rejected') {
      if (type === 'incoming') callStatus = 'incomingRejected';
      else callStatus = 'outgoingRejected';
    } else if (call.getStatus() === 'cancelled') {
      if (type == 'incoming') {
        callStatus = 'cancelledByMe';
      } else {
        callStatus = 'cancelledByThem';
      }
    } else if (call.getStatus() === 'unanswered') {
      if (type === 'incoming') callStatus = 'unansweredByMe';
      if (type === 'outgoing') callStatus = 'unansweredByThem';
    } else if (call.getStatus() === 'initiated') {
      if (type == 'incoming') {
        callStatus = 'incomingBusy';
      } else {
        callStatus = 'outgoingBusy';
      }
    }

    if (!callStatus) {
      console.log('UNKNOW: ', call);
    }
    return {type, callStatus};
  };

  static getCallStatusDisplayIcon = (
    callStatus: string,
    theme: CometChatTheme,
  ): JSX.Element => {
    const callStatusIcon = {
      outgoing: <CallMade height={24} width={24} color={theme.color.success} />,
      outgoingCallEnded: (
        <CallMade height={24} width={24} color={theme.color.success} />
      ),
      cancelledByMe: (
        <CallMade height={24} width={24} color={theme.color.success} />
      ),
      outgoingRejected: (
        <CallMade height={24} width={24} color={theme.color.success} />
      ),
      outgoingBusy: (
        <CallMade height={24} width={24} color={theme.color.success} />
      ),
      unansweredByThem: (
        <CallMissedOutgoingFill
          height={24}
          width={24}
          color={theme.color.error}
        />
      ),

      incoming: (
        <CallReceived height={24} width={24} color={theme.color.success} />
      ),
      incomingCallEnded: (
        <CallReceived height={24} width={24} color={theme.color.success} />
      ),
      cancelledByThem: (
        <CallMissedFill height={24} width={24} color={theme.color.error} />
      ),
      incomingRejected: (
        <CallMissedFill height={24} width={24} color={theme.color.error} />
      ),
      incomingBusy: (
        <CallMissedFill height={24} width={24} color={theme.color.error} />
      ),
      unansweredByMe: (
        <CallMissedFill height={24} width={24} color={theme.color.error} />
      ),
    } as const;
    return callStatusIcon[callStatus as keyof typeof callStatusIcon];
  };

  static getCallStatusDisplayText = (
    callStatus: string,
  ): string => {
    const callStatusDisplayText = {
      outgoing: 'Outgoing Call',
      outgoingCallEnded: 'Outgoing Call',
      cancelledByMe: 'Outgoing Call',
      outgoingRejected: 'Outgoing Call',
      outgoingBusy: 'Outgoing Call',
      unansweredByThem: 'Outgoing Call',

      incoming: 'Incoming Call',
      incomingCallEnded: 'Incoming Call',
      cancelledByThem: 'Missed Call',
      incomingRejected: 'Missed Call',
      incomingBusy: 'Missed Call',
      unansweredByMe: 'Missed Call',
    } as const;
    return callStatusDisplayText[
      callStatus as keyof typeof callStatusDisplayText
    ];
  };
}
