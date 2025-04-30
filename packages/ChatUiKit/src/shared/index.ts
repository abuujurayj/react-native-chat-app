import { Icon } from "./icons/Icon";

import {
  AdditionalParams,
  ConversationType,
  MessageBubbleAlignmentType,
  MessageListAlignmentType,
  MessageTimeAlignmentType,
  SelectionMode,
} from "./base";

import {
  CometChatConversationEvents,
  CometChatGroupsEvents,
  CometChatUIEventHandler,
  CometChatUIEvents,
  MessageEvents,
} from "./events";
import {
  ChatConfigurator,
  DataSource,
  DataSourceDecorator,
  ExtensionsDataSource,
  MessageDataSource,
} from "./framework";
import {
  CometChatMessageOption,
  CometChatMessageTemplate,
} from "./modals";
import { CometChatLocalize, localize } from "./resources/CometChatLocalize";
import {
  CometChatConversationUtils,
  CometChatMessagePreview,
  CometChatSoundManager,
  MessagePreviewStyle,
} from "./utils";

import {
  ActionItemInterface,
  BadgeStyle,
  CometChatActionSheet,
  CometChatAudioBubble,
  CometChatAudioBubbleInterface,
  CometChatAvatar,
  CometChatBadge,
  CometChatBottomSheet,
  CometChatBottomSheetInterface,
  CometChatConfirmDialog,
  CometChatConfirmDialogInterface,
  CometChatDate,
  CometChatDateInterface,
  CometChatEmojiKeyboard,
  CometChatFileBubble,
  CometChatFileBubbleInterface,
  CometChatImageBubble,
  CometChatImageBubbleInterface,
  CometChatList,
  CometChatListActionsInterface,
  CometChatListItem,
  CometChatListItemInterface,
  CometChatListProps,
  CometChatListStylesInterface,
  CometChatMediaRecorder,
  CometChatMediaRecorderInterface,
  CometChatMessageInput,
  CometChatMessageInputInterface,
  CometChatQuickReactions,
  CometChatReactionList,
  CometChatReactionListInterface,
  CometChatReactions,
  CometChatReactionsInterface,
  CometChatStatusIndicator,
  CometChatStatusIndicatorInterface,
  CometChatSuggestionList,
  CometChatSuggestionListInterface,
  CometChatTextBubble,
  CometChatTextBubbleInterface,
  CometChatVideoBubble,
  CometChatVideoBubbleInterface,
  DateStyle,
  SuggestionItem,
  CometChatReceipt,
  MenuItemInterface
} from "./views";

import {
  CometChatMentionsFormatter,
  CometChatTextFormatter,
  CometChatUrlsFormatter,
  MentionTextStyle,
} from "./formatters";

import { CometChatUIKit, CometChatUIKitHelper, UIKitSettings } from "./CometChatUiKit";

import { CometChatMessageComposerAction } from "./helper/types";

import * as CometChatUiKitConstants from "./constants/UIKitConstants";

import { messageStatus } from "./utils/CometChatMessageHelper/index";

export type {
  DataSource,
  DateStyle,
  ConversationType,
  CometChatSuggestionListInterface,
  CometChatTextBubbleInterface,
  CometChatVideoBubbleInterface,
  MessageBubbleAlignmentType,
  CometChatMessageInputInterface,
  CometChatMessageOption,
  CometChatReactionListInterface,
  CometChatReactionsInterface,
  CometChatStatusIndicatorInterface,
  MessageListAlignmentType,
  MessageTimeAlignmentType,
  SelectionMode,
  CometChatBottomSheetInterface,
  CometChatFileBubbleInterface,
  CometChatConfirmDialogInterface,
  CometChatDateInterface,
  CometChatImageBubbleInterface,
  CometChatListActionsInterface,
  CometChatListItemInterface,
  CometChatListStylesInterface,
  CometChatMediaRecorderInterface,
  CometChatListProps,
  CometChatMessageComposerAction,
  ActionItemInterface,
  AdditionalParams,
  CometChatAudioBubbleInterface,
  BadgeStyle,
  MenuItemInterface
};

export {
  //
  ChatConfigurator,
  //
  CometChatActionSheet,
  CometChatAudioBubble,
  CometChatAvatar,
  CometChatBadge,
  CometChatBottomSheet,
  CometChatConfirmDialog,
  CometChatConversationEvents,
  //
  CometChatConversationUtils,
  CometChatDate,
  CometChatEmojiKeyboard,
  CometChatFileBubble,
  CometChatGroupsEvents,
  CometChatImageBubble,
  //
  CometChatList,
  //
  CometChatListItem,
  //
  CometChatLocalize,
  CometChatMediaRecorder,
  CometChatMentionsFormatter,
  CometChatMessageInput,
  CometChatMessagePreview,
  CometChatMessageTemplate,
  //
  CometChatQuickReactions,
  CometChatReactionList,
  CometChatReactions,
  CometChatSoundManager,
  CometChatStatusIndicator,
  CometChatSuggestionList,
  CometChatTextBubble,
  CometChatTextFormatter,
  // CometChatTheme,
  CometChatUIEventHandler,
  CometChatUIEvents,
  CometChatUIKit,
  CometChatUIKitHelper,
  CometChatUiKitConstants,
  CometChatUrlsFormatter,
  CometChatVideoBubble,
  DataSourceDecorator,
  ExtensionsDataSource,
  MentionTextStyle,
  MessageDataSource,
  MessageEvents,
  MessagePreviewStyle,
  SuggestionItem,
  // Typography,
  UIKitSettings,
  localize,
  messageStatus,
  CometChatReceipt,
  Icon
};
