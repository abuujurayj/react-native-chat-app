import { CometChat } from "@cometchat/chat-sdk-react-native";
import { CometChatTheme } from "../../theme/type";
import {
  AdditionalParams,
  MessageBubbleAlignmentType,
} from "../base/Types";
import {
  CometChatMentionsFormatter,
  CometChatTextFormatter,
  CometChatUrlsFormatter,
} from "../formatters";
import { CometChatMessageComposerAction } from "../helper/types";
import { CometChatMessageOption } from "../modals/CometChatMessageOption";
import { CometChatMessageTemplate } from "../modals/CometChatMessageTemplate";

export interface DataSource {
  //message options based on types
  getTextMessageOptions(
    loggedInUser: CometChat.User,
    messageObject: CometChat.BaseMessage,
    theme: CometChatTheme,
    group?: CometChat.Group
  ): Array<CometChatMessageOption>;
  getAudioMessageOptions(
    loggedInUser: CometChat.User,
    messageObject: CometChat.BaseMessage,
    theme: CometChatTheme,
    group?: CometChat.Group
  ): Array<CometChatMessageOption>;
  getVideoMessageOptions(
    loggedInUser: CometChat.User,
    messageObject: CometChat.BaseMessage,
    theme: CometChatTheme,
    group?: CometChat.Group
  ): Array<CometChatMessageOption>;
  getImageMessageOptions(
    loggedInUser: CometChat.User,
    messageObject: CometChat.BaseMessage,
    theme: CometChatTheme,
    group?: CometChat.Group
  ): Array<CometChatMessageOption>;
  getFileMessageOptions(
    loggedInUser: CometChat.User,
    messageObject: CometChat.BaseMessage,
    theme: CometChatTheme,
    group?: CometChat.Group
  ): Array<CometChatMessageOption>;
  getMessageOptions(
    loggedInUser: CometChat.User,
    messageObject: CometChat.BaseMessage,
    theme: CometChatTheme,
    group?: CometChat.Group
  ): Array<CometChatMessageOption>;
  getCommonOptions(
    loggedInUser: CometChat.User,
    messageObject: CometChat.BaseMessage,
    theme: CometChatTheme,
    group?: CometChat.Group
  ): Array<CometChatMessageOption>;

  //views
  getBottomView(message: CometChat.BaseMessage, alignment: MessageBubbleAlignmentType): JSX.Element | null;
  getDeleteMessageBubble(message: CometChat.BaseMessage, theme: CometChatTheme): JSX.Element;
  getVideoMessageBubble(
    videoUrl: string,
    thumbnailUrl: string,
    message: CometChat.MediaMessage,
    theme: CometChatTheme
  ): JSX.Element | null;
  getTextMessageBubble(
    messageText: string,
    message: CometChat.TextMessage,
    alignment: MessageBubbleAlignmentType,
    theme: CometChatTheme,
    additionalParams?: AdditionalParams
  ): JSX.Element;
  getImageMessageBubble(
    imageUrl: string,
    caption: string,
    message: CometChat.MediaMessage,
    theme: CometChatTheme
  ): JSX.Element;
  getAudioMessageBubble(
    audioUrl: string,
    title: string,
    style: any, //ToDoM: remove any
    message: CometChat.MediaMessage,
    theme: CometChatTheme
  ): JSX.Element;
  getFileMessageBubble(
    fileUrl: string,
    title: string,
    style: any, //ToDoM: remove any
    message: CometChat.MediaMessage,
    theme: CometChatTheme
  ): JSX.Element;
  getGroupActionBubble(message: CometChat.BaseMessage, theme: CometChatTheme): JSX.Element | null;

  //content views
  getTextMessageContentView(
    message: CometChat.BaseMessage,
    alignment: MessageBubbleAlignmentType,
    theme: CometChatTheme,
    additionalParams?: AdditionalParams
  ): JSX.Element;
  getAudioMessageContentView(
    message: CometChat.BaseMessage,
    alignment: MessageBubbleAlignmentType,
    theme: CometChatTheme
  ): JSX.Element;
  getVideoMessageContentView(
    message: CometChat.BaseMessage,
    alignment: MessageBubbleAlignmentType,
    theme: CometChatTheme
  ): JSX.Element | null;
  getImageMessageContentView(
    message: CometChat.BaseMessage,
    alignment: MessageBubbleAlignmentType,
    theme: CometChatTheme
  ): JSX.Element | null;
  getFileMessageContentView(
    message: CometChat.BaseMessage,
    alignment: MessageBubbleAlignmentType,
    theme: CometChatTheme
  ): JSX.Element;

  //templates
  getTextMessageTemplate(
    theme: CometChatTheme,
    additionalParams?: AdditionalParams
  ): CometChatMessageTemplate;
  getAudioMessageTemplate(theme: CometChatTheme): CometChatMessageTemplate;
  getVideoMessageTemplate(theme: CometChatTheme): CometChatMessageTemplate;
  getImageMessageTemplate(theme: CometChatTheme): CometChatMessageTemplate;
  getFileMessageTemplate(theme: CometChatTheme): CometChatMessageTemplate;
  getAllMessageTemplates(
    theme: CometChatTheme,
    additionalParams?: AdditionalParams
  ): Array<CometChatMessageTemplate>;
  getMessageTemplate(
    messageType: string,
    MessageCategory: string,
    theme: CometChatTheme
  ): CometChatMessageTemplate | null;
  getGroupActionTemplate(theme: CometChatTheme): CometChatMessageTemplate;
  getFormMessageTemplate(theme: CometChatTheme): CometChatMessageTemplate;
  getSchedulerMessageTemplate(theme: CometChatTheme): CometChatMessageTemplate;
  getCardMessageTemplate(theme: CometChatTheme): CometChatMessageTemplate;

  //attachment options
  // getAttachmentOptions(theme: CometChatTheme, conversation: CometChat.User | CometChat.Group): Array<CometChatMessageComposerAction>

  getAllMessageTypes(): Array<string>;
  getAllMessageCategories(): Array<string>;

  //auxiliary options
  getAuxiliaryOptions(
    user?: CometChat.User,
    group?: CometChat.Group,
    id?: Map<string, any>,
    additionalParams?: AdditionalParams
  ): JSX.Element[];

  getId(): string;

  //unknown
  getMessageTypeToSubtitle(messageType: string): string;
  //Message Composer
  getAttachmentOptions: (theme: CometChatTheme, user?: any, group?: any, composerId?: any) => any;
  getAuxiliaryButtonOptions: () => any;

  getLastConversationMessage(
    conversation: CometChat.Conversation,
    theme?: CometChatTheme
  ): string | JSX.Element;

  getAuxiliaryHeaderAppbarOptions(
    user?: CometChat.User,
    group?: CometChat.Group,
    additionalParams?: AdditionalParams
  ): JSX.Element | null;

  getAllTextFormatters(loggedInUser?: CometChat.User): CometChatTextFormatter[];
  getMentionsFormatter(loggedInUser?: CometChat.User): CometChatMentionsFormatter;
  getUrlsFormatter(loggedInUser?: CometChat.User): CometChatUrlsFormatter;
}
