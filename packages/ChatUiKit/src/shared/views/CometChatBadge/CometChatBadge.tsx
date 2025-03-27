import React, { useMemo } from "react";
import { Text, View } from "react-native";
import { useTheme } from "../../../theme";
import { useCompTheme } from "../../../theme/hook";
import { deepMerge } from "../../helper/helperFunctions";
import { BadgeStyle } from "./styles";

/**
 *
 * CometChatBadge is a component useful when returning the number of unread messages in a chat.
 * This component is used to return the unread message count with custom style.
 *
 * @author CometChat
 *
 */
export interface CometChatBadgeProps {
  count: number | string;
  style?: Partial<BadgeStyle>;
}

export const CometChatBadge = (props: CometChatBadgeProps) => {
  const { style = {}, count = 0 } = props;
  const theme = useTheme();

  const badgeStyle = useMemo(() => {
    return deepMerge(theme.badgeStyle, style ?? {});
  }, [theme.badgeStyle, style]);

  const countText: string = useMemo(() => {
    if (Number.isInteger(count)) {
      if ((count as number) === 0) return "";
      if ((count as number) > 999) return "999+";
      return (count as number).toString();
    }
    return count.toString();
  }, [count]);

  if (countText.length === 0) return null;

  return (
    <View style={[badgeStyle.containerStyle]}>
      <Text style={[badgeStyle.textStyle]}>{countText}</Text>
    </View>
  );
};
