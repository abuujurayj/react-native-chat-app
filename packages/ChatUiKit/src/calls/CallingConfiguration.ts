import { CometChat } from "@cometchat/chat-sdk-react-native";
import { CometChatCallButtonConfiguration } from "./CometChatCallButtons";

export class CallingConfiguration {
  callButtonsConfiguration?: CometChatCallButtonConfiguration;
  groupCallSettingsBuilder?: (
    user?: CometChat.User,
    group?: CometChat.Group,
    isAudioOnly?: boolean
  ) => CometChat.CallSettingsBuilder;

  constructor(params: {
    callButtonsConfiguration?: CometChatCallButtonConfiguration;
    groupCallSettingsBuilder?: (
      user?: CometChat.User,
      group?: CometChat.Group,
      isAudioOnly?: boolean
    ) => CometChat.CallSettingsBuilder;
  }) {
    this.callButtonsConfiguration = params.callButtonsConfiguration;
    this.groupCallSettingsBuilder = params.groupCallSettingsBuilder;
  }
}
