import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  StyleProp,
  ViewStyle,
  TextStyle,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useTheme } from "../../../theme";
import { useCometChatTranslation } from "../../resources/CometChatLocalizeNew";
import { Icon } from "../../icons/Icon";
import { CometChat } from "@cometchat/chat-sdk-react-native";
import { useKeyboard } from "../../helper/useKeyboard";

export interface CometChatReportDialogInterface {
  /** Controls modal visibility */
  isOpen?: boolean;
  /** Message object to be flagged */
  message?: CometChat.BaseMessage;
  /** Hide remark input field */
  hideFlagRemarkField?: boolean;
  /** Callback for cancel */
  onCancel?: () => void;
  /** Modal dismiss callback */
  onDismiss?: () => void;
  /** Optional custom handler after successful flag (receives SDK payload incl. original message) */
  onReport?: (payload: {
    message: CometChat.BaseMessage;
    reason: CometChat.FlagReason;
    description: string;
  }) => void | Promise<void>;
  /** Override reasons instead of fetching (mainly for testing) */
  reasons?: CometChat.FlagReason[];
  /** Text overrides / translations */
  titleText?: string;
  messageText?: string;
  descriptionPlaceholder?: string;
  cancelButtonText?: string;
  reportButtonText?: string;
  /** Styling overrides */
  containerStyle?: StyleProp<ViewStyle>;
  titleContainerStyle?: StyleProp<ViewStyle>;
  titleTextStyle?: StyleProp<TextStyle>;
  messageTextStyle?: StyleProp<TextStyle>;
  pillsContainerStyle?: StyleProp<ViewStyle>;
  pillStyle?: StyleProp<ViewStyle>;
  pillTextStyle?: StyleProp<TextStyle>;
  textInputContainerStyle?: StyleProp<ViewStyle>;
  sectionTitle?: StyleProp<TextStyle>;
  descriptionTextStyle?: StyleProp<TextStyle>;
  buttonContainerStyle?: StyleProp<ViewStyle>;
  cancelButtonStyle?: StyleProp<ViewStyle>;
  cancelButtonTextStyle?: StyleProp<TextStyle>;
  reportButtonStyle?: StyleProp<ViewStyle>;
  reportButtonTextStyle?: StyleProp<TextStyle>;
  /** Error callback */
  onError?: (error: CometChat.CometChatException) => void;
}

export const CometChatReportDialog = (props: CometChatReportDialogInterface) => {
  const { t } = useCometChatTranslation();
  const keyboardHeight = useKeyboard();
  const {
    isOpen,
    message,
    hideFlagRemarkField = false,
    onCancel,
    onDismiss = () => null,
    onReport,
    reasons,
    titleText = t("Flag_Message_Title"),
    messageText = t("Flag_Message_Subtitle"),
    descriptionPlaceholder = t("Flag_Message_Remark_Placeholder"),
    cancelButtonText = t("Flag_Message_Confirm_No"),
    reportButtonText = t("Flag_Message_Confirm_Yes"),
    containerStyle = {},
    titleContainerStyle = {},
    titleTextStyle = {},
    messageTextStyle = {},
    pillsContainerStyle = {},
    pillStyle = {},
    pillTextStyle = {},
    buttonContainerStyle = {},
    textInputContainerStyle = {},
    sectionTitle = {},
    descriptionTextStyle = {},
    cancelButtonStyle = {},
    cancelButtonTextStyle = {},
    reportButtonStyle = {},
    reportButtonTextStyle = {},
    onError,
  } = props;

  const theme = useTheme();
  const [flagReasons, setFlagReasons] = useState<CometChat.FlagReason[]>(reasons || []);
  const [isFetchingReasons, setIsFetchingReasons] = useState<boolean>(false);
  const [selectedReason, setSelectedReason] = useState<CometChat.FlagReason | null>(null);
  const [description, setDescription] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorTimeoutId, setErrorTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [isTextInputFocused, setIsTextInputFocused] = useState<boolean>(false);

  const resetStates = () => {
    setSelectedReason(null);
    setDescription("");
    setErrorMessage("");
    setIsSubmitting(false);
  };

  useEffect(() => {
    if (isOpen && !reasons) {
      (async () => {
        try {
          setIsFetchingReasons(true);
          const list = await CometChat.getFlagReasons();
          setFlagReasons(list);
        } catch (e: any) {
          onError?.(e);
          showError(t("Flag_Error_Text"));
        } finally {
          setIsFetchingReasons(false);
        }
      })();
    } else if (reasons) {
      setFlagReasons(reasons);
    }
    if (!isOpen) {
      resetStates();
    }
  }, [isOpen, reasons, onError, t]);

  const handleCancel = () => {
    resetStates();
    onCancel?.();
  };

  const showError = (message: string) => {
    // Clear any existing timer
    if (errorTimeoutId) {
      clearTimeout(errorTimeoutId);
    }
    setErrorMessage(message);
    const id = setTimeout(() => {
      setErrorMessage("");
    }, 3500); // auto clear after 3.5 seconds
    setErrorTimeoutId(id);
  };

  const handleReport = async () => {
    // Validation: missing reason
    if (!selectedReason) {
      return;
    }
    if (!message) {
      showError(t("Flag_Error_Text"));
      return;
    }
    setIsSubmitting(true);
    try {
      // Trim remark length (max 100 similar to web)
      const remark = description.trim().substring(0, 100);
      const messageId = String((message as any).getId?.() ?? "");
      if (!messageId) {
        throw new Error("Invalid message id");
      }
      // SDK call
      const sdkResult = await CometChat.flagMessage(messageId, {
        reasonId: selectedReason.id,
        remark: remark.trim().length > 0 ? remark.trim() : undefined,
      });
      console.log("[ReportDialog] flagMessage() success:", sdkResult);
      // Fire optional external callback
      const result = onReport?.({ message, reason: selectedReason, description: remark });
      if (result && typeof (result as Promise<any>).then === "function") {
        await (result as Promise<any>);
      }
      // Show success toast then auto-close after 3s
      setErrorMessage("");
    } catch (e: any) {
      onError?.(e);
      showError(t("Flag_Error_Text"));
      console.log("[ReportDialog] flagMessage() error:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    return () => {
      if (errorTimeoutId) clearTimeout(errorTimeoutId);
    };
  }, [errorTimeoutId]);

  return (
    <Modal
      animationType='fade'
      transparent
      visible={isOpen}
      onRequestClose={handleCancel}
      onDismiss={onDismiss}
    >
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={[
            styles.wrapper,
            (keyboardHeight > 0 || isTextInputFocused) && styles.wrapperWithKeyboard,
          ]}
          keyboardShouldPersistTaps='handled'
          showsVerticalScrollIndicator={false}
        >
          <View style={[theme.reportDialogStyles.containerStyle, containerStyle]}>
            <View style={[theme.reportDialogStyles.titleContainerStyle, titleContainerStyle]}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={[theme.reportDialogStyles.titleTextStyle, titleTextStyle]}>
                  {titleText}
                </Text>
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    handleCancel();
                  }}
                >
                  <Icon name='close' size={24} color={theme.color.iconPrimary} />
                </TouchableOpacity>
              </View>
              <Text style={[theme.reportDialogStyles.messageTextStyle, messageTextStyle]}>
                {messageText}
              </Text>
            </View>

            <View style={[theme.reportDialogStyles.pillsContainerStyle, pillsContainerStyle]}>
              {isFetchingReasons && (
                <Text style={[theme.reportDialogStyles.messageTextStyle, { marginBottom: 8 }]}>
                  {"Loading..."}
                </Text>
              )}
              {!isFetchingReasons &&
                flagReasons.map((r) => {
                  const active = r.id === selectedReason?.id;
                  return (
                    <TouchableOpacity
                      key={r.id}
                      disabled={isSubmitting}
                      onPress={(e) => {
                        e.stopPropagation();
                        // Toggle selection: if already selected, deselect
                        setSelectedReason((prev) => (prev?.id === r.id ? null : r));
                        setErrorMessage("");
                      }}
                      style={[
                        theme.reportDialogStyles.pillsStyle,
                        {
                          backgroundColor: active
                            ? theme.color.extendedPrimary100
                            : theme.color.background1,
                          borderColor: active
                            ? theme.color.extendedPrimary200
                            : theme.color.borderDefault,
                          opacity: isSubmitting ? 0.6 : 1,
                        },
                        pillStyle,
                      ]}
                    >
                      <Text
                        numberOfLines={2}
                        style={[
                          theme.reportDialogStyles.pillsTextStyle,
                          pillTextStyle,
                          {
                            color: active ? theme.color.textHighlight : theme.color.textPrimary,
                          },
                        ]}
                      >
                        {r.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
            </View>

            {!hideFlagRemarkField && (
              <View
                style={[theme.reportDialogStyles.textInputContainerStyle, textInputContainerStyle]}
              >
                <Text style={[theme.reportDialogStyles.sectionTitle, sectionTitle]}>
                  {t("Flag_Message_Remark_Label")}{" "}
                  <Text style={{ color: theme.color.textTertiary }}>
                    ({t("Flag_Message_Remark_Optional")})
                  </Text>
                </Text>
                <View>
                  <TextInput
                    placeholder={descriptionPlaceholder}
                    placeholderTextColor={theme.color.textTertiary}
                    multiline
                    value={description}
                    onFocus={() => setIsTextInputFocused(true)}
                    onBlur={() => setIsTextInputFocused(false)}
                    onChangeText={(val) => setDescription(val.substring(0, 100))}
                    editable={!isSubmitting}
                    style={[theme.reportDialogStyles.descriptionTextStyle, descriptionTextStyle]}
                  />
                </View>
              </View>
            )}

            {!!errorMessage && (
              <Text style={{ color: theme.color.error, marginBottom: 16 }}>{errorMessage}</Text>
            )}

            <View style={[theme.reportDialogStyles.buttonContainer, buttonContainerStyle]}>
              <TouchableOpacity
                style={[theme.reportDialogStyles.cancelButtonStyle, cancelButtonStyle]}
                disabled={isSubmitting}
                onPress={(e) => {
                  e.stopPropagation();
                  handleCancel();
                }}
              >
                <Text
                  numberOfLines={1}
                  style={[theme.reportDialogStyles.cancelButtonTextStyle, cancelButtonTextStyle]}
                >
                  {cancelButtonText}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  theme.reportDialogStyles.confirmButtonStyle,
                  {
                    backgroundColor:
                      !selectedReason || isSubmitting
                        ? theme.color.background4
                        : theme.color.primary,
                    opacity: isSubmitting ? 0.7 : 1,
                  },
                  reportButtonStyle,
                ]}
                // Allow press even if no reason to surface error
                disabled={!selectedReason || isSubmitting}
                onPress={(e) => {
                  e.stopPropagation();
                  handleReport();
                }}
              >
                <Text
                  numberOfLines={1}
                  style={[theme.reportDialogStyles.confirmButtonTextStyle, reportButtonTextStyle]}
                >
                  {reportButtonText}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  wrapper: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#141414CC",
    paddingHorizontal: 20,
    minHeight: "100%",
  },
  wrapperWithKeyboard: {
    justifyContent: "flex-start",
    paddingTop: Platform.OS === "ios" ? 50 : 20,
  },
});

export default CometChatReportDialog;
