import { CometChat } from "@cometchat/chat-sdk-react-native";
import { OutgoingCallConfiguration } from "../CometChatOutgoingCall";

export interface CometChatCallButtonConfigurationInterface {
  callSettingsBuilder?: (
    user?: CometChat.User,
    group?: CometChat.Group,
    isAudioOnly?: boolean
  ) => CometChat.CallSettingsBuilder;
  outgoingCallConfiguration?: OutgoingCallConfiguration;
}

export class CometChatCallButtonConfiguration implements CometChatCallButtonConfigurationInterface {
  callSettingsBuilder?: (
    user?: CometChat.User,
    group?: CometChat.Group,
    isAudioOnly?: boolean
  ) => CometChat.CallSettingsBuilder;

  constructor({ callSettingsBuilder }: CometChatCallButtonConfigurationInterface) {
    this.callSettingsBuilder = callSettingsBuilder;
  }
}
