import { ImageSourcePropType, ImageStyle, ImageURISource } from "react-native";
import { CometChatTextFormatter } from "../formatters";
import { CometChatTheme } from "../../theme/type";
import { DeepPartial } from "../helper/types";

export type SelectionMode = "none" | "single" | "multiple";

export type ConversationType = "both" | "users" | "groups";

export type MessageListAlignmentType = "standard" | "leftAligned";

export type MessageBubbleAlignmentType = "left" | "right" | "center";

export type MessageTimeAlignmentType = "top" | "bottom";

export type AdditionalParams = {
  textFormatters?: CometChatTextFormatter[];
  disableMentions?: boolean;
  callButtonStyle?: DeepPartial<CometChatTheme['callButtonStyles']>;
  stickerIconStyle?: {
    active: ImageStyle,
    inactive: ImageStyle;
  };
  stickerIcon?: JSX.Element | ImageSourcePropType;
};

//AdditionalParams