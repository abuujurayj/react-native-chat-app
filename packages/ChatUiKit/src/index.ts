/// <reference path="./imageresolver.d.ts" />

import {
  ActionItemInterface,
  AdditionalParams,
  //Add Call events here already exposed in Calls
  //Framework
  ChatConfigurator,
  CometChatActionSheet,
  CometChatAudioBubble,
  CometChatAudioBubbleInterface,
  CometChatAvatar,
  CometChatBadge,
  CometChatBottomSheet,
  CometChatBottomSheetInterface,
  CometChatConfirmDialog,
  CometChatConfirmDialogInterface,
  CometChatConversationEvents,
  //Utils
  CometChatConversationUtils,
  CometChatDate,
  CometChatDateInterface,
  CometChatEmojiKeyboard,
  CometChatFileBubble,
  CometChatFileBubbleInterface,
  CometChatGroupsEvents,
  CometChatImageBubble,
  CometChatImageBubbleInterface,
  CometChatListActionsInterface,
  //View
  CometChatListItem,
  CometChatListItemInterface,
  CometChatListStylesInterface,
  //Resources
  CometChatMediaRecorder,
  CometChatMediaRecorderInterface,
  CometChatMentionsFormatter,
  CometChatMessageComposerAction,
  CometChatMessageInputInterface,
  CometChatMessageOption,
  CometChatMessagePreview,
  CometChatMessageTemplate,
  CometChatQuickReactions,
  CometChatReactionList,
  CometChatReactionListInterface,
  CometChatReactions,
  CometChatReactionsInterface,
  CometChatSoundManager,
  CometChatStatusIndicator,
  CometChatStatusIndicatorInterface,
  CometChatSuggestionList,
  CometChatSuggestionListInterface,
  CometChatTextBubble,
  CometChatTextBubbleInterface,
  CometChatTextFormatter,
  //Events
  CometChatUIEventHandler,
  CometChatUIEvents,
  //CometChatUIKit
  CometChatUIKit,
  CometChatUIKitHelper,
  CometChatUiKitConstants,
  CometChatUrlsFormatter,
  CometChatVideoBubble,
  CometChatVideoBubbleInterface,
  ConversationType,
  DataSource,
  DataSourceDecorator,
  ExtensionsDataSource,
  MentionTextStyle,
  MessageBubbleAlignmentType,
  MessageDataSource,
  MessageEvents,
  MessageListAlignmentType,
  MessageTimeAlignmentType,
  SelectionMode,
  SuggestionItem,
  UIKitSettings,
  messageStatus,
  Icon,
  MenuItemInterface,
  getCometChatTranslation,
  getCurrentLanguage,
} from "./shared";

import { stopStreamingForRunId, startStreamingForRunId, streamingState$, getStreamSpeed, setAIAssistantTools, setQueueCompletionCallback, removeQueueCompletionCallback, IStreamData,QueueCompletionCallback,checkAndTriggerQueueCompletion, getAIAssistantTools, handleWebsocketMessage, messageStream, notifyStreamRenderComplete, onConnected, onConnectionError, onDisconnected, setStreamSpeed, storeAIAssistantMessage, streamConnection$ } from "./shared/services/stream-message.service";

import  { StreamMessage}  from "./shared/modals/StreamMessage";
import {CometChatAIAssistantTools} from "./shared/modals/CometChatAIAssistantTools";

import {
  CometChatUsers,
  CometChatUsersActionsInterface,
  CometChatUsersInterface,
} from "./CometChatUsers";

import { CometChatGroups, CometChatGroupsInterface } from "./CometChatGroups";

import {
  CometChatConversations,
  ConversationInterface
} from "./CometChatConversations";

import { CometChatGroupMembers, CometChatGroupMembersInterface } from "./CometChatGroupMembers";

import {
  CometChatMessageInformation,
  CometChatMessageInformationInterface,
} from "./CometChatMessageInformation";

import {
  CometChatMessageList,
  CometChatMessageListActionsInterface,
  CometChatMessageListProps,
} from "./CometChatMessageList";

import {
  CometChatMessageComposer,
  CometChatMessageComposerInterface,
} from "./CometChatMessageComposer";

import { CometChatAIAssistantChatHistory } from "./CometChatAIAssistantChatHistory";

import { CometChatThreadHeader, CometChatThreadHeaderInterface } from "./CometChatThreadHeader";

import {
  CallButtonStyle,
  CallUIEvents,
  CallingExtension,
  CallingExtensionDecorator,
  CallingPackage,
  CometChatMeetCallBubble,
  CometChatCallButtonConfiguration,
  CometChatCallButtonConfigurationInterface,
  CometChatCallButtons,
  CometChatCallButtonsInterface,
  CometChatCallLogs,
  CometChatCallLogsConfigurationInterface,
  CometChatIncomingCall,
  CometChatOngoingCall,
  CometChatOutgoingCall,
} from "./calls";

import {
  CollaborativeDocumentExtension,
  CollaborativeWhiteboardExtension,
  CometChatCollaborativeDocumentBubble,
  CometChatCollaborativeWhiteBoardBubble,
  CometChatCreatePoll,
  CometChatCreatePollInterface,
  CometChatStickerBubble,
  CometChatStickerBubbleInterface,
  ExtensionConstants,
  LinkPreviewBubble,
  LinkPreviewBubbleInterface,
  LinkPreviewExtension,
  MessageTranslationBubble,
  MessageTranslationExtension,
  PollsConfigurationInterface,
  PollsExtension,
  StickerConfigurationInterface,
  StickersExtension,
  ThumbnailGenerationExtension,
} from "./extensions";

import { CometChatMessageListProps as CometChatMessageListInterface } from "./CometChatMessageList";
import { CometChatTheme } from "./theme/type";
import { getLastSeenTime } from "./shared";
export {
  CallUIEvents,
  CallingExtension,
  CallingExtensionDecorator,
  CallingPackage,
  //
  ChatConfigurator,
  CollaborativeDocumentExtension,
  CollaborativeWhiteboardExtension,
  //
  CometChatActionSheet,
  CometChatAudioBubble,
  CometChatAvatar,
  CometChatBadge,
  CometChatBottomSheet,
  CometChatMeetCallBubble,
  CometChatCallButtonConfiguration,
  /* Call Buttons */
  CometChatCallButtons,
  /*Call Logs */
  CometChatCallLogs,
  CometChatCollaborativeDocumentBubble,
  CometChatCollaborativeWhiteBoardBubble,
  CometChatConfirmDialog,
  CometChatConversationEvents,
  //
  CometChatConversationUtils,
  CometChatConversations,
  CometChatCreatePoll,
  CometChatDate,
  /* Reactions */
  /* Emoji Keyboard */
  CometChatEmojiKeyboard,
  CometChatFileBubble,
  CometChatGroups,
  CometChatGroupsEvents,
  CometChatGroupMembers,
  CometChatAIAssistantChatHistory,
  CometChatImageBubble,
  CometChatIncomingCall,
  //
  //
  CometChatListItem,
  //
  CometChatMediaRecorder,
  /* Emoji Keyboard */
  /* Text Formatters */
  CometChatMentionsFormatter,
  CometChatMessageComposer,
  CometChatMessageInformation,
  CometChatMessageList,
  CometChatMessagePreview,
  CometChatMessageTemplate,
  CometChatOngoingCall,
  //
  CometChatOutgoingCall,
  CometChatQuickReactions,
  CometChatReactionList,
  /*Call Logs */
  /* Reactions */
  CometChatReactions,
  CometChatSoundManager,
  CometChatStatusIndicator,
  CometChatStickerBubble,
  CometChatSuggestionList,
  CometChatTextBubble,
  CometChatTextFormatter,
  CometChatThreadHeader,
  CometChatUIEventHandler,
  CometChatUIEvents,
  CometChatUIKit,
  CometChatUIKitHelper,
  CometChatUiKitConstants,
  CometChatUrlsFormatter,
  CometChatUsers,
  CometChatVideoBubble,
  DataSourceDecorator,
  ExtensionConstants,
  ExtensionsDataSource,
  LinkPreviewBubble,
  LinkPreviewExtension,
  MentionTextStyle,
  MessageDataSource,
  MessageEvents,
  MessageTranslationBubble,
  MessageTranslationExtension,
  PollsExtension,
  StickersExtension,
  SuggestionItem,
  ThumbnailGenerationExtension,
  UIKitSettings,
  messageStatus,
  Icon,
  getCometChatTranslation,
  getCurrentLanguage,
  CometChatAIAssistantTools,
  StreamMessage,
  stopStreamingForRunId,
  startStreamingForRunId,
  streamingState$,
  getStreamSpeed,
  setAIAssistantTools,
  setQueueCompletionCallback,
  removeQueueCompletionCallback,
  type IStreamData,
  type QueueCompletionCallback,
  checkAndTriggerQueueCompletion,
  getAIAssistantTools,
  handleWebsocketMessage,
  messageStream,
  notifyStreamRenderComplete,
  onConnected,
  onConnectionError,
  onDisconnected,
  setStreamSpeed,
  storeAIAssistantMessage,
  streamConnection$
};
export { CometChatThemeProvider, useTheme } from "./theme";

export {CometChatI18nProvider,useCometChatTranslation} from "./shared/resources/CometChatLocalizeNew"
export {localizedDateHelperInstance,LocalizedDateHelper} from "./shared/helper/LocalizedDateHelper"
export { useLocalizedDate } from "./shared/helper/useLocalizedDateHook";

export { CometChatMessageHeader } from "./CometChatMessageHeader";
export {getLastSeenTime}

export type {
  CometChatMessageComposerAction,
  CallButtonStyle,
  CometChatGroupsInterface,
  CometChatGroupMembersInterface,
  CometChatFileBubbleInterface,
  CometChatImageBubbleInterface,
  CometChatListActionsInterface,
  CometChatListItemInterface,
  CometChatListStylesInterface,
  CometChatMessageInformationInterface,
  CometChatMessageInputInterface,
  CometChatMessageListActionsInterface,
  CometChatMessageListInterface,
  CometChatMessageComposerInterface,
  CometChatMessageListProps,
  CometChatMessageOption,
  ActionItemInterface,
  AdditionalParams,
  SelectionMode,
  CometChatReactionsInterface,
  CometChatReactionListInterface,
  CometChatMediaRecorderInterface,
  CometChatDateInterface,
  CometChatCreatePollInterface,
  CometChatConfirmDialogInterface,
  CometChatCallLogsConfigurationInterface,
  CometChatCallButtonsInterface,
  CometChatCallButtonConfigurationInterface,
  CometChatBottomSheetInterface,
  CometChatAudioBubbleInterface,
  CometChatStatusIndicatorInterface,
  CometChatStickerBubbleInterface,
  CometChatSuggestionListInterface,
  CometChatTextBubbleInterface,
  CometChatThreadHeaderInterface,
  CometChatUsersActionsInterface,
  CometChatUsersInterface,
  CometChatVideoBubbleInterface,
  ConversationInterface,
  LinkPreviewBubbleInterface,
  PollsConfigurationInterface,
  StickerConfigurationInterface,
  ConversationType,
  DataSource,
  MessageListAlignmentType,
  MessageTimeAlignmentType,
  MessageBubbleAlignmentType,
  CometChatTheme,
  MenuItemInterface
};
