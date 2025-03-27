import React, { useMemo } from "react";
import { Text, View } from "react-native";
import { useTheme } from "../../../theme";
import { useCompTheme } from "../../../theme/hook";
import { DateHelper, dateHelperInstance } from "../../helper/dateHelper";
import { deepMerge } from "../../helper/helperFunctions";
import { ValueOf } from "../../helper/types";
import { DateStyle } from "./styles";

/**
 * CometChatDate is a component useful for displaying date/time
 * This component displays the date/time based on pattern parameter.
 *
 * @Version 1.0.0
 * @author CometChat
 *
 */

export interface CometChatDateInterface {
  /**
   * Unix epoch time.
   */
  timeStamp: number;
  /**
   * Pattern for Date.
   * one of
   * 1. timeFormat: "hh:mm a".
   * 2. dayDateFormat: Today, Yesterday, week-day or "d MMM, yyyy".
   * 3. dayWeekDayDateTimeFormat: Today, Yesterday, week-day or "dd/mm/yyyy".
   */
  pattern?: ValueOf<typeof DateHelper.patterns>;
  /**
   * A string for custom date reprasentation.
   */
  customDateString?: string;

  style?: DateStyle;
}

export const CometChatDate = (props: CometChatDateInterface) => {
  const { timeStamp, pattern, customDateString, style = {} } = props;
  const theme = useTheme();
  const compTheme = useCompTheme();

  const dateStyles = useMemo(() => {
    return deepMerge(theme.dateStyles, compTheme.dateStyles ?? {}, style);
  }, [theme.dateStyles, style, compTheme.dateStyles]);

  return (
    <View style={[dateStyles.containerStyle]}>
      <Text style={[dateStyles.textStyle]} numberOfLines={1}>
        {customDateString
          ? customDateString
          : pattern && dateHelperInstance.getFormattedDate(timeStamp, pattern)}
      </Text>
    </View>
  );
};
