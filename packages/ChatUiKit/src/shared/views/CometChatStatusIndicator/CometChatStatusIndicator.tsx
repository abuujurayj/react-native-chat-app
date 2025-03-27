import { CometChat } from "@cometchat/chat-sdk-react-native";
import React, { useMemo } from "react";
import { Image, View } from "react-native";
import { useTheme } from "../../../theme";
import { useCompTheme } from "../../../theme/hook";
import { deepMerge } from "../../helper/helperFunctions";
import { StatusIndicatorStyles } from "./styles";

export interface CometChatStatusIndicatorInterface {
  type?: "online" | "offline" | "private" | "protected" | "public";
  style?: Partial<StatusIndicatorStyles>;
}

/**
 *
 * CometChatStatusIndicator is a component useful for indicating the status of user/group
 * This component displays the online/offline status of user/group
 *
 * @author CometChat
 *
 */

export const CometChatStatusIndicator = ({
  type = "offline",
  style = {},
}: CometChatStatusIndicatorInterface) => {
  const theme = useTheme();
  const compTheme = useCompTheme();
  const statusIndicatorStyles = useMemo(() => {
    return deepMerge(theme.statusIndicatorStyles, compTheme.statusIndicatorStyles ?? {}, style);
  }, [theme, compTheme, style]);

  if (type === CometChat.USER_STATUS.ONLINE) {
    return (
      <View
        style={[statusIndicatorStyles.containerStyle, statusIndicatorStyles.containerStyleOnline]}
      />
    );
  }
  if (type === CometChat.GROUP_TYPE.PRIVATE) {
    return (
      <View
        style={[statusIndicatorStyles.containerStyle, statusIndicatorStyles.containerStylePrivate]}
      >
        <Image
          style={[statusIndicatorStyles.imageStyle, statusIndicatorStyles.imageStylePrivate]}
          source={require("./private.png")}
        />
      </View>
    );
  }
  if (type === CometChat.GROUP_TYPE.PROTECTED) {
    return (
      <View
        style={[
          statusIndicatorStyles.containerStyle,
          statusIndicatorStyles.containerStyleProtected,
        ]}
      >
        <Image
          style={[statusIndicatorStyles.imageStyle, statusIndicatorStyles.imageStyleProtected]}
          source={require("./protected.png")}
        />
      </View>
    );
  }
  return null;
};
