import { ColorValue, ViewStyle, TextStyle } from "react-native";
import { deepMerge } from "../shared/helper/helperFunctions";
import { CometChatTheme } from "../theme/type";
import { DeepPartial } from "../shared/helper/types";

export type ChatHistoryStyle = {
  containerStyle: ViewStyle;
  headerStyle: ViewStyle;
  headerContentStyle: ViewStyle;
  headerTitleStyle: TextStyle;
  closeButtonStyle: ViewStyle;
  closeButtonTextStyle: TextStyle;
  newChatButtonStyle: ViewStyle;
  newChatTextStyle: TextStyle;
  listContainerStyle: ViewStyle;
  sectionHeaderStyle: ViewStyle;
  sectionHeaderTextStyle: TextStyle;
  messageItemStyle: ViewStyle;
  messageTextStyle: TextStyle;
  centerContainerStyle: ViewStyle;
  stateTitleStyle: TextStyle;
  stateTextStyle: TextStyle;
  footerLoaderStyle: ViewStyle;
  skeletonStyle: {
    linearGradientColors: [string, string];
    shimmerBackgroundColor: ColorValue;
    shimmerOpacity: number;
    speed: number;
  };
};

export const getChatHistoryStyleLight = (
  color: CometChatTheme["color"],
  spacing: CometChatTheme["spacing"],
  typography: CometChatTheme["typography"]
): DeepPartial<ChatHistoryStyle> => {
  return {
    containerStyle: {
      flex: 1,
      backgroundColor: color.background3,
    },
    headerStyle: {
      paddingTop: spacing.padding.p4,
      paddingBottom: spacing.padding.p4,
      backgroundColor: color.background3,
    },
    headerContentStyle: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.padding.p3,
      borderBottomColor: color.borderDefault,
      borderBottomWidth: 1,
      paddingBottom: spacing.padding.p4,
      width: '100%',
    },
    headerTitleStyle: {
      fontSize: typography.heading4.medium.fontSize,
      fontWeight: typography.heading4.medium.fontWeight,
      color: color.textPrimary,
      marginLeft: spacing.margin.m2,
      ...typography.heading4.medium,
      fontFamily: typography.heading4.medium.fontFamily,
    },
    closeButtonStyle: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    closeButtonTextStyle: {
      fontSize: 18,
      color: color.textSecondary,
    },
    newChatButtonStyle: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.padding.p4,
      paddingVertical: spacing.padding.p2,
      marginBottom: spacing.margin.m2,
      backgroundColor: color.background3,
    },
    newChatTextStyle: {
      fontSize: typography.body.regular.fontSize,
      marginLeft: spacing.margin.m3,
      fontWeight: typography.body.regular.fontWeight,
      color: color.textPrimary,
      ...typography.body.regular,
    },
    listContainerStyle: {
      paddingHorizontal: spacing.padding.p5,
    },
    sectionHeaderStyle: {
      paddingVertical: spacing.padding.p2,
      backgroundColor: color.background3,
      borderBottomWidth: 1,
      borderBottomColor: color.borderLight,
    },
    sectionHeaderTextStyle: {
      fontSize: typography.caption1.medium.fontSize,
      fontWeight: typography.caption1.medium.fontWeight,
      textTransform: 'capitalize',
      color: color.textTertiary,
      ...typography.caption1.medium,
    },
    messageItemStyle: {
      paddingVertical: spacing.padding.p3,
    },
    messageTextStyle: {
      fontSize: typography.body.regular.fontSize,
      lineHeight: 20,
      color: color.textPrimary,
      ...typography.body.regular,
    },
    centerContainerStyle: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.padding.p5,
      backgroundColor: color.background3,
    },
    stateTitleStyle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: spacing.margin.m2,
      color: color.textPrimary,
      ...typography.heading3.bold,
    },
    stateTextStyle: {
      fontSize: 16,
      textAlign: 'center',
      color: color.textSecondary,
      ...typography.body.regular,
    },
    footerLoaderStyle: {
      paddingVertical: spacing.padding.p4,
      alignItems: 'center',
    },
    skeletonStyle: {
      linearGradientColors: ["#E8E8E8", "#F5F5F5"],
      shimmerBackgroundColor: color.background3,
      shimmerOpacity: 0.01,
      speed: 0.1,
    },
  };
};

export const getChatHistoryStyleDark = (
  color: CometChatTheme["color"],
  spacing: CometChatTheme["spacing"],
  typography: CometChatTheme["typography"]
): DeepPartial<ChatHistoryStyle> => {
  return deepMerge(getChatHistoryStyleLight(color, spacing, typography), {
    skeletonStyle: {
      linearGradientColors: ["#383838", "#272727"],
      shimmerBackgroundColor: color.background3,
      shimmerOpacity: 0.01,
      speed: 0.1,
    },
  });
};