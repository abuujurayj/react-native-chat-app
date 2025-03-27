import React from "react";
import {
  ImageSourcePropType,
  ImageStyle,
  Modal,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { useTheme } from "../../../theme";
import { Icon } from "../../icons/Icon";

export interface CometChatConfirmDialogInterface {
  onConfirm?: () => void;
  onCancel?: () => void;
  onDismiss?:() => void;
  isOpen?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  icon?: ImageSourcePropType | JSX.Element;
  iconImageStyle?: StyleProp<ImageStyle>;
  iconContainerStyle?: StyleProp<ViewStyle>;
  titleTextStyle?: StyleProp<TextStyle>;
  messageTextStyle?: StyleProp<TextStyle>;
  cancelButtonStyle?: StyleProp<ViewStyle>;
  confirmButtonStyle?: StyleProp<ViewStyle>;
  cancelButtonTextStyle?: StyleProp<TextStyle>;
  confirmButtonTextStyle?: StyleProp<TextStyle>;

  titleText?: string;
  messageText?: string;
  cancelButtonText?: string;
  confirmButtonText?: string;
}
export const CometChatConfirmDialog = (props: CometChatConfirmDialogInterface) => {
  const {
    onConfirm,
    onCancel,
    onDismiss = () => null,
    isOpen,
    icon,
    containerStyle = {},
    iconImageStyle = {},
    iconContainerStyle = {},
    titleTextStyle = {},
    messageTextStyle = {},
    cancelButtonStyle = {},
    confirmButtonStyle = {},
    cancelButtonTextStyle = {},
    confirmButtonTextStyle = {},
    titleText = "",
    messageText = "",
    cancelButtonText = "Cancel",
    confirmButtonText = "Delete",
  } = props;

  const theme = useTheme();

  return (
    <Modal animationType='fade' transparent={true} visible={isOpen} onRequestClose={onCancel} onDismiss={onDismiss}>
      <Pressable onPress={onCancel} style={styles.wrapper}>
        <View style={[theme.confirmDialogStyles.containerStyle, containerStyle]}>
          {icon && (
            <View style={[theme.confirmDialogStyles.iconContainerStyle, iconContainerStyle]}>
              <Icon
                icon={icon}
                imageStyle={[theme.confirmDialogStyles.iconImageStyle, iconImageStyle]}
              />
            </View>
          )}
          {titleText && (
            <Text style={[theme.confirmDialogStyles.titleTextStyle, titleTextStyle]}>
              {titleText}
            </Text>
          )}
          {messageText && (
            <Text style={[theme.confirmDialogStyles.messageTextStyle, messageTextStyle]}>
              {messageText}
            </Text>
          )}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[theme.confirmDialogStyles.cancelButtonStyle, cancelButtonStyle]}
              onPress={(e) => {
                e.stopPropagation();
                onCancel?.();
              }}
            >
              <Text
                style={[theme.confirmDialogStyles.cancelButtonTextStyle, cancelButtonTextStyle]}
              >
                {cancelButtonText}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[theme.confirmDialogStyles.confirmButtonStyle, confirmButtonStyle]}
              onPress={(e) => {
                e.stopPropagation();
                onConfirm?.();
              }}
            >
              <Text
                style={[theme.confirmDialogStyles.confirmButtonTextStyle, confirmButtonTextStyle]}
              >
                {confirmButtonText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#141414CC",
    paddingHorizontal: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    width: "100%",
    gap: 8,
  },
});
