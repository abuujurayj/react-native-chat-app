import { CometChat } from "@cometchat/chat-sdk-react-native";
import { CometChatTheme } from "../../theme/type";
import { AdditionalParams, MessageBubbleAlignmentType } from "../base/Types";
import {
  CometChatMentionsFormatter,
  CometChatTextFormatter,
  CometChatUrlsFormatter,
} from "../formatters";
import { CometChatMessageComposerAction } from "../helper/types";
import { CometChatMessageOption, CometChatMessageTemplate } from "../modals";
import { DataSource } from "./DataSource";

export class DataSourceDecorator implements DataSource {
  dataSource: DataSource;

  constructor(dataSource: DataSource) {
    this.dataSource = dataSource;
  }

  getId(): string {
    throw new Error("Method not implemented.");
  }

  getTextMessageOptions(
    loggedInUser: CometChat.User,
    messageObject: CometChat.BaseMessage,
    theme: CometChatTheme,
    group?: CometChat.Group
  ): CometChatMessageOption[] {
    return this.dataSource.getTextMessageOptions(loggedInUser, messageObject, theme, group);
  }

  getAudioMessageOptions(
    loggedInUser: CometChat.User,
    messageObject: CometChat.BaseMessage,
    theme: CometChatTheme,
    group?: CometChat.Group
  ): CometChatMessageOption[] {
    return this.dataSource.getAudioMessageOptions(loggedInUser, messageObject, theme, group);
  }

  getVideoMessageOptions(
    loggedInUser: CometChat.User,
    messageObject: CometChat.BaseMessage,
    theme: CometChatTheme,
    group?: CometChat.Group
  ): CometChatMessageOption[] {
    return this.dataSource.getVideoMessageOptions(loggedInUser, messageObject, theme, group);
  }

  getImageMessageOptions(
    loggedInUser: CometChat.User,
    messageObject: CometChat.BaseMessage,
    theme: CometChatTheme,
    group?: CometChat.Group
  ): CometChatMessageOption[] {
    return this.dataSource.getImageMessageOptions(loggedInUser, messageObject, theme, group);
  }

  getFileMessageOptions(
    loggedInUser: CometChat.User,
    messageObject: CometChat.BaseMessage,
    theme: CometChatTheme,
    group?: CometChat.Group
  ): CometChatMessageOption[] {
    return this.dataSource.getFileMessageOptions(loggedInUser, messageObject, theme, group);
  }

  getMessageOptions(
    loggedInUser: CometChat.User,
    messageObject: CometChat.BaseMessage,
    theme: CometChatTheme,
    group?: CometChat.Group
  ): CometChatMessageOption[] {
    return this.dataSource.getMessageOptions(loggedInUser, messageObject, theme, group);
  }

  getCommonOptions(
    loggedInUser: CometChat.User,
    messageObject: CometChat.BaseMessage,
    theme: CometChatTheme,
    group?: CometChat.Group
  ): CometChatMessageOption[] {
    return this.dataSource.getCommonOptions(loggedInUser, messageObject, theme, group);
  }

  getBottomView(message: CometChat.BaseMessage, alignment: MessageBubbleAlignmentType) {
    return this.dataSource.getBottomView(message, alignment);
  }

  getDeleteMessageBubble(message: CometChat.BaseMessage, theme: CometChatTheme) {
    return this.dataSource.getDeleteMessageBubble(message, theme);
  }

  getVideoMessageBubble(
    videoUrl: string,
    thumbnailUrl: string,
    message: CometChat.MediaMessage,
    theme: CometChatTheme
  ): JSX.Element | null {
    return this.dataSource.getVideoMessageBubble(videoUrl, thumbnailUrl, message, theme);
  }

  getTextMessageBubble(
    messageText: string,
    message: CometChat.TextMessage,
    alignment: MessageBubbleAlignmentType,
    theme: CometChatTheme,
    additionalParams?: AdditionalParams
  ) {
    return this.dataSource.getTextMessageBubble(
      messageText,
      message,
      alignment,
      theme,
      additionalParams
    );
  }

  getImageMessageBubble(
    imageUrl: string,
    caption: string,
    message: CometChat.MediaMessage,
    theme: CometChatTheme
  ) {
    return this.dataSource.getImageMessageBubble(imageUrl, caption, message, theme);
  }

  getAudioMessageBubble(
    audioUrl: string,
    title: string,
    style: {}, //ToDoM: remove any
    message: CometChat.MediaMessage,
    theme: CometChatTheme
  ) {
    return this.dataSource.getAudioMessageBubble(audioUrl, title, style, message, theme);
  }

  getFileMessageBubble(
    fileUrl: string,
    title: string,
    style: any, //ToDoM: remove any
    message: CometChat.MediaMessage,
    theme: CometChatTheme
  ) {
    return this.dataSource.getFileMessageBubble(fileUrl, title, style, message, theme);
  }

  getGroupActionBubble(message: CometChat.BaseMessage, theme: CometChatTheme) {
    return this.dataSource.getGroupActionBubble(message, theme);
  }

  getTextMessageContentView(
    message: CometChat.BaseMessage,
    alignment: MessageBubbleAlignmentType,
    theme: CometChatTheme,
    additionalParams?: AdditionalParams
  ) {
    return this.dataSource.getTextMessageContentView(message, alignment, theme, additionalParams);
  }

  getAudioMessageContentView(
    message: CometChat.BaseMessage,
    alignment: MessageBubbleAlignmentType,
    theme: CometChatTheme
  ) {
    return this.dataSource.getAudioMessageContentView(message, alignment, theme);
  }

  getVideoMessageContentView(
    message: CometChat.BaseMessage,
    alignment: MessageBubbleAlignmentType,
    theme: CometChatTheme
  ) {
    return this.dataSource.getVideoMessageContentView(message, alignment, theme);
  }

  getImageMessageContentView(
    message: CometChat.BaseMessage,
    alignment: MessageBubbleAlignmentType,
    theme: CometChatTheme
  ) {
    return this.dataSource.getImageMessageContentView(message, alignment, theme);
  }

  getFileMessageContentView(
    message: CometChat.BaseMessage,
    alignment: MessageBubbleAlignmentType,
    theme: CometChatTheme
  ) {
    return this.dataSource.getFileMessageContentView(message, alignment, theme);
  }

  getTextMessageTemplate(
    theme: CometChatTheme,
    additionalParams?: AdditionalParams
  ): CometChatMessageTemplate {
    return this.dataSource.getTextMessageTemplate(theme, additionalParams);
  }

  getFormMessageTemplate(theme: CometChatTheme): CometChatMessageTemplate {
    return this.dataSource.getFormMessageTemplate(theme);
  }

  getSchedulerMessageTemplate(theme: CometChatTheme): CometChatMessageTemplate {
    return this.dataSource.getSchedulerMessageTemplate(theme);
  }

  getCardMessageTemplate(theme: CometChatTheme): CometChatMessageTemplate {
    return this.dataSource.getCardMessageTemplate(theme);
  }

  getAudioMessageTemplate(theme: CometChatTheme): CometChatMessageTemplate {
    return this.dataSource.getAudioMessageTemplate(theme);
  }

  getVideoMessageTemplate(theme: CometChatTheme): CometChatMessageTemplate {
    return this.dataSource.getVideoMessageTemplate(theme);
  }

  getImageMessageTemplate(theme: CometChatTheme): CometChatMessageTemplate {
    return this.dataSource.getImageMessageTemplate(theme);
  }

  getFileMessageTemplate(theme: CometChatTheme): CometChatMessageTemplate {
    return this.dataSource.getFileMessageTemplate(theme);
  }

  getAllMessageTemplates(
    theme: CometChatTheme,
    additionalParams?: AdditionalParams
  ): CometChatMessageTemplate[] {
    return this.dataSource.getAllMessageTemplates(theme, additionalParams);
  }

  getMessageTemplate(
    messageType: string,
    MessageCategory: string,
    theme: CometChatTheme
  ): CometChatMessageTemplate | null {
    return this.dataSource.getMessageTemplate(messageType, MessageCategory, theme);
  }

  getGroupActionTemplate(theme: CometChatTheme): CometChatMessageTemplate {
    return this.dataSource.getGroupActionTemplate(theme);
  }

  getAllMessageTypes(): string[] {
    return this.dataSource.getAllMessageTypes();
  }

  getAllMessageCategories(): string[] {
    return this.dataSource.getAllMessageCategories();
  }

  getAuxiliaryOptions(
    user: CometChat.User,
    group: CometChat.Group,
    id: Map<string, any>,
    additionalParams?: AdditionalParams
  ) {
    return this.dataSource.getAuxiliaryOptions(user, group, id, additionalParams);
  }

  getMessageTypeToSubtitle(messageType: string): string {
    return this.dataSource.getMessageTypeToSubtitle(messageType);
  }

  getAttachmentOptions(
    theme: CometChatTheme,
    user?: any,
    group?: any,
    composerId?: any
  ): CometChatMessageComposerAction[] {
    return this.dataSource.getAttachmentOptions(theme, user, group, composerId);
  }

  getAuxiliaryButtonOptions() {
    return this.dataSource.getAuxiliaryButtonOptions();
  }

  getLastConversationMessage(
    conversation: CometChat.Conversation,
    theme?: CometChatTheme
  ): string | JSX.Element {
    return this.dataSource.getLastConversationMessage(conversation, theme);
  }

  getAuxiliaryHeaderAppbarOptions(
    user?: CometChat.User,
    group?: CometChat.Group,
    additionalParams?: AdditionalParams
  ) {
    return this.dataSource.getAuxiliaryHeaderAppbarOptions(user, group, additionalParams);
  }

  getAllTextFormatters(loggedInUser?: CometChat.User): CometChatTextFormatter[] {
    return [
      this.dataSource.getMentionsFormatter(loggedInUser),
      this.dataSource.getUrlsFormatter(loggedInUser),
    ];
  }

  getMentionsFormatter(loggedInUser?: CometChat.User): CometChatMentionsFormatter {
    return this.dataSource.getMentionsFormatter(loggedInUser);
  }

  getUrlsFormatter(loggedInUser?: CometChat.User): CometChatUrlsFormatter {
    return this.dataSource.getUrlsFormatter(loggedInUser);
  }
}
