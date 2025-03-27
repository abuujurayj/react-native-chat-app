import React, { useLayoutEffect, useState } from "react";
import { StyleProp, Text, TextStyle, View, ViewStyle } from "react-native";
import {
  CometChatMentionsFormatter,
  CometChatTextFormatter,
  CometChatUrlsFormatter,
} from "../../formatters";

export interface CometChatTextBubbleInterface {
  /**
   * text tobe shown
   */
  text?: string;
  textStyle?: StyleProp<TextStyle>;
  /**
   * text container style
   */
  textContainerStyle?: StyleProp<ViewStyle>;
  textFormatters?: Array<
    CometChatMentionsFormatter | CometChatUrlsFormatter | CometChatTextFormatter
  >;
}

//toDoM How will use theme here since we don't have alrignment here?
export const CometChatTextBubble = (props: CometChatTextBubbleInterface) => {
  const { textContainerStyle } = props;

  return (
    <View style={textContainerStyle}>
      <CometChatTextBubbleText {...props} />
    </View>
  );
};

export const CometChatTextBubbleText = (
  props: Omit<CometChatTextBubbleInterface, "textContainerStyle">
) => {
  const { text = "", textFormatters, textStyle } = props;
  const [formattedText, setFormattedText] = useState<string>();

  useLayoutEffect(() => {
    let finalText = text;
    if (textFormatters && textFormatters.length) {
      if (textFormatters) {
        for (let i = 0; i < textFormatters.length; i++) {
          finalText = textFormatters[i].getFormattedText(finalText);
        }
      }
    }
    setFormattedText(finalText as string);
  }, [text]);

  return <Text style={textStyle}>{formattedText}</Text>;
};
