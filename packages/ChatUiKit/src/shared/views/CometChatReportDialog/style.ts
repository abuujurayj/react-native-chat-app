import { StyleSheet, TextStyle, ViewStyle } from "react-native";
import { CometChatTheme } from "../../../theme/type";
import { deepMerge } from "../../helper/helperFunctions";

export type ReportDialogStyle = {
  containerStyle: ViewStyle;
  titleContainerStyle: ViewStyle;
  titleTextStyle: TextStyle;
  messageTextStyle: TextStyle;
  pillsContainerStyle: ViewStyle;
  pillsStyle: ViewStyle;
  pillsTextStyle: TextStyle;
  textInputContainerStyle: ViewStyle;
  sectionTitle: TextStyle;
  descriptionTextStyle: TextStyle;
  buttonContainer: ViewStyle;
  cancelButtonStyle: ViewStyle;
  cancelButtonTextStyle: TextStyle;
  confirmButtonStyle: ViewStyle;
  confirmButtonTextStyle: TextStyle;
};

export const getReportDialogStyleLight = (
  color: CometChatTheme["color"],
  spacing: CometChatTheme["spacing"],
  typography: CometChatTheme["typography"]
): ReportDialogStyle => {
  return StyleSheet.create({
    containerStyle: {
      backgroundColor: color.background1,
      width: "100%",
      padding: 24,
      maxWidth: 500,
      borderRadius: 16,
      borderColor: color.borderDark,
      shadowColor: "#000",
      shadowOpacity: 0.12,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 6 },
      elevation: 6,
    },
    titleContainerStyle: {
      borderBottomColor: color.borderLight,
      borderBottomWidth: 1,
      paddingBottom: 16,
      marginBottom: 16,
      gap: 8,
    },
    titleTextStyle: {
      color: color.textPrimary,
      ...typography.heading2.bold,
    },
    messageTextStyle: {
      color: color.textSecondary,
      ...typography.button.regular,
    },
    pillsContainerStyle: {
      width: "100%",
      marginBottom: 16,
      flexDirection: "row",
      flexWrap: "wrap",
    },
    pillsStyle: {
      borderWidth: 1,
      borderRadius: 24,
      borderColor: color.borderDefault,
      paddingVertical: 10,
      paddingHorizontal: 16,
      marginBottom: 8,
      marginRight: 8,
    },
    pillsTextStyle: {
      color: color.textPrimary,
      ...typography.button.regular,
    },
    textInputContainerStyle: {
      width: "100%",
      marginBottom: 24,
    },
    sectionTitle: {
      ...typography.body.medium,
      color: color.textPrimary,
      marginBottom: 8,
    },
    descriptionTextStyle: {
      borderWidth: 1,
      borderRadius: 12,
      minHeight: 100,
      padding: 12,
      textAlignVertical: "top",
      maxHeight: 100,
      borderColor: color.borderLight,
      color: color.textPrimary,
      ...typography.body.regular,
    },
    buttonContainer: {
      flexDirection: "row",
      width: "100%",
      gap: 12,
    },
    cancelButtonStyle: {
      flex: 1,
      borderRadius: spacing.radius.r2,
      height: 40,
      backgroundColor: color.background1,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: color.borderDark,
    },
    cancelButtonTextStyle: {
      color: color.textPrimary,
      ...typography.button.medium,
      paddingHorizontal: 6,
      textAlign: "center",
    },
    confirmButtonStyle: {
      flex: 1,
      backgroundColor: color.error,
      borderRadius: spacing.radius.r2,
      height: 40,
      justifyContent: "center",
      alignItems: "center",
    },
    confirmButtonTextStyle: {
      color: color.primaryButtonIcon,
      paddingHorizontal: 6,
      textAlign: "center",
      ...typography.button.medium,
    },
  });
};

export const getReportDialogStyleDark = (
  color: CometChatTheme["color"],
  spacing: CometChatTheme["spacing"],
  typography: CometChatTheme["typography"]
): ReportDialogStyle => {
  return <ReportDialogStyle>(
    deepMerge(getReportDialogStyleLight(color, spacing, typography), {
      containerStyle: {
        backgroundColor: color.background2,
      },
      titleTextStyle: {
        color: color.textPrimary,
      },
      messageTextStyle: {
        color: color.textSecondary,
      },
      cancelButtonStyle: {
        borderColor: color.borderDark,
      },
      cancelButtonTextStyle: {
        color: color.textPrimary,
      },
      confirmButtonStyle: {
        backgroundColor: color.error,
      },
      confirmButtonTextStyle: {
        color: color.primaryButtonIcon,
      },
    })
  );
};
