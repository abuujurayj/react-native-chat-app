import React from "react";
import { Text, View } from "react-native";
import { useTheme } from "../../../theme";
import { DateHelper, dateHelperInstance } from "../../helper/dateHelper";
import { ValueOf } from "../../helper/types";
import { CometChatTheme } from "../../../theme/type";

/**
 * CometChatDateSeparator is a component useful for displaying date/time
 * in between messages.
 *
 * @Version 1.0.0
 * @author CometChat
 *
 */

export interface CometChatDateSeparatorInterface {
  timeStamp: number;
  /**
   * Pattern for Date.
   * one of
   * 1. timeFormat: "hh:mm a".
   * 2. dayDateFormat: Today, Yesterday, or "d MMM, yyyy".
   * 3. dayWeekDayDateTimeFormat: Today(time), weekday, Yesterday, or "dd/mm/yyyy".
   */
  pattern: ValueOf<typeof DateHelper.patterns>;
  /**
   * A string for custom date reprasentation.
   */
  customDateString?: string;

  style?: CometChatTheme['dateSeparatorStyles'];
}

export const CometChatDateSeparator = (props: CometChatDateSeparatorInterface) => {
  const { timeStamp, pattern, customDateString, style } = props;
  const theme = useTheme();

  return (
    <View style={[theme.dateSeparatorStyles.containerStyle, style?.containerStyle]}>
      <Text style={[theme.dateSeparatorStyles.textStyle, style?.textStyle]}>
        {customDateString
          ? customDateString
          : dateHelperInstance.getFormattedDate(timeStamp, pattern)}
      </Text>
    </View>
  );
};
