import React from "react";
import { TouchableOpacity } from "react-native";
import { stopStreamingForRunId } from "../../services/stream-message.service";
import { useTheme } from "../../../theme";
import { Icon } from "../../../shared/icons/Icon";

type CometChatSendButtonViewProps = {
  isButtonDisabled: boolean;
  composerRef: any;
  isStreaming: boolean;
  showStopButton: boolean;
  setShowStopButton: (show: boolean) => void;
};

const CometChatSendButtonView = ({
  isButtonDisabled,
  composerRef,
  isStreaming,
  showStopButton,
  setShowStopButton,
}: CometChatSendButtonViewProps) => {
  const theme = useTheme();

  const handlePress = () => {
    if (isButtonDisabled) {
      return;
    }
    
    if (isStreaming || showStopButton) {
      setShowStopButton(false);
      stopStreamingForRunId();
    } else {
      setShowStopButton(true);
      setTimeout(() => {
        composerRef.current?.sendTextMessage?.();
      }, 0);
    }
  };

  const shouldShowStop = isStreaming || showStopButton;
  const isActive = shouldShowStop || !isButtonDisabled;
  const backgroundColor =
    theme.mode === "light"
      ? isActive
        ? theme.color.secondaryButtonBackground
        : theme.color.background4
      : isActive
      ? theme.color.staticWhite
      : theme.color.background4;
  const iconColor =
    theme.mode === "light"
      ? isActive
        ? theme.color.staticWhite
        : theme.color.staticWhite
      : isActive
      ? theme.color.staticBlack
      : theme.color.staticBlack

  
  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isButtonDisabled && shouldShowStop}
      style={{
        display: "flex",
        width: 40,
        height: 40,
        paddingVertical: theme.spacing.padding.p4,
        paddingHorizontal: theme.spacing.padding.p3,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 9999,
        backgroundColor,
      }}
    >
      <Icon
        name={shouldShowStop ? "stop-fill" : "ai-send-button"}
        width={20}
        height={20}
        color={iconColor}
      />
    </TouchableOpacity>
  );
};

export { CometChatSendButtonView };