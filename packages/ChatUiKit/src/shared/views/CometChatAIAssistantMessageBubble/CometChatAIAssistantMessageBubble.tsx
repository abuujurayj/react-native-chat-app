import React, { useRef, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { CometChat } from '@cometchat/chat-sdk-react-native';
import { useTheme } from '../../../theme';
import { CometChatTheme } from '../../../theme/type';

export interface CometChatAIAssistantMessageBubbleProps {
  message: any;
  theme?: CometChatTheme;
  style?: any;
}

const getMessageText = (message: any) => {
  if (!message) return '';
  if (message instanceof CometChat.CustomMessage) {
    const customData = message.getData();
    if (customData?.text) return customData.text;
    if (customData?.assistantMessageData?.getText) return customData.assistantMessageData.getText();
  }
  if (typeof message.getAssistantMessageData === 'function') {
    const assistantData = message.getAssistantMessageData();
    if (assistantData?.getText) return assistantData.getText();
  }
  if (typeof message.getText === 'function') return message.getText();
  if (typeof message.text === 'string') return message.text;
  return '';
};

const CometChatAIAssistantMessageBubble: React.FC<CometChatAIAssistantMessageBubbleProps> = ({ 
  message, 
  style: bubbleStyle 
}) => {
  const theme = useTheme();
  const text = getMessageText(message);

  // Use the bubbleStyle passed from parent, with theme fallbacks
  const styles = StyleSheet.create({
    container: {
      backgroundColor: bubbleStyle?.containerStyle?.backgroundColor || 'transparent',
      borderRadius: bubbleStyle?.containerStyle?.borderRadius || theme.spacing.radius.r3,
      minWidth: bubbleStyle?.containerStyle?.minWidth || 90,
      alignSelf: bubbleStyle?.containerStyle?.alignSelf || 'flex-start',
      maxWidth: '100%',
      ...bubbleStyle?.containerStyle,
    },
    textContainer: {
      ...bubbleStyle?.textContainerStyle,
    },
    text: {
      color: bubbleStyle?.textStyle?.color || theme.color.receiveBubbleText,
      fontFamily: bubbleStyle?.textStyle?.fontFamily || theme.typography.body.regular.fontFamily,
      fontSize: bubbleStyle?.textStyle?.fontSize || theme.typography.body.regular.fontSize,
      ...bubbleStyle?.textStyle,
    },
    placeholderText: {
      color: bubbleStyle?.placeholderTextStyle?.color || theme.color.receiveBubbleText,
      fontFamily: bubbleStyle?.placeholderTextStyle?.fontFamily || theme.typography.body.regular.fontFamily,
      fontSize: bubbleStyle?.placeholderTextStyle?.fontSize || theme.typography.body.regular.fontSize,
      opacity: bubbleStyle?.placeholderTextStyle?.opacity || 0.6,
      fontStyle: 'italic',
      ...bubbleStyle?.placeholderTextStyle,
    },
    copyButton: {
      backgroundColor: bubbleStyle?.copyButtonStyle?.backgroundColor || theme.color.primary,
      padding: bubbleStyle?.copyButtonStyle?.padding || theme.spacing.padding.p1,
      borderRadius: bubbleStyle?.copyButtonStyle?.borderRadius || theme.spacing.radius.r1,
      ...bubbleStyle?.copyButtonStyle,
    },
    errorContainer: {
      backgroundColor: bubbleStyle?.errorContainerStyle?.backgroundColor || theme.color.error,
      padding: bubbleStyle?.errorContainerStyle?.padding || theme.spacing.padding.p2,
      borderRadius: bubbleStyle?.errorContainerStyle?.borderRadius || theme.spacing.radius.r2,
      marginTop: bubbleStyle?.errorContainerStyle?.marginTop || theme.spacing.margin.m1,
      ...bubbleStyle?.errorContainerStyle,
    },
    errorText: {
      color: bubbleStyle?.errorTextStyle?.color || theme.color.background1,
      fontFamily: bubbleStyle?.errorTextStyle?.fontFamily || theme.typography.caption1.regular.fontFamily,
      fontSize: bubbleStyle?.errorTextStyle?.fontSize || theme.typography.caption1.regular.fontSize,
      ...bubbleStyle?.errorTextStyle,
    },
  });

  // Create markdown styles based on theme
  const markdownStyles = useMemo(() => ({
    body: {
      color: bubbleStyle?.textStyle?.color || theme.color.receiveBubbleText,
      fontFamily: bubbleStyle?.textStyle?.fontFamily || theme.typography.body.regular.fontFamily,
      fontSize: bubbleStyle?.textStyle?.fontSize || theme.typography.body.regular.fontSize,
      ...bubbleStyle?.textStyle,
      margin: 0,
      padding: 0,
      textAlignVertical: 'top',
    },
    text: {
      fontFamily: bubbleStyle?.textStyle?.fontFamily || theme.typography.body.regular.fontFamily,
      fontSize: bubbleStyle?.textStyle?.fontSize || theme.typography.body.regular.fontSize,
      ...(bubbleStyle?.textStyle && Object.fromEntries(
        Object.entries(bubbleStyle.textStyle).filter(([key]) => key !== 'color')
      )),
    },
    paragraph: {
      color: bubbleStyle?.textStyle?.color || theme.color.receiveBubbleText,
      margin: 0,
      padding: 0,
    },
    code_inline: {
      backgroundColor: theme.color.background3,
      color: theme.color.textHighlight,
      borderRadius: theme.spacing.radius.r1,
      padding: theme.spacing.padding.p0_5,
    },
    code_block: {
      backgroundColor: theme.color.background3,
      color: bubbleStyle?.textStyle?.color || theme.color.receiveBubbleText,
      borderRadius: theme.spacing.radius.r2,
      padding: theme.spacing.padding.p2,
      fontFamily: 'monospace',
    },
    fence: {
      backgroundColor: theme.color.background3,
      color: bubbleStyle?.textStyle?.color || theme.color.receiveBubbleText,
      borderRadius: theme.spacing.radius.r2,
      borderWidth: 1,
      borderColor: theme.color.borderDefault,
      padding: theme.spacing.padding.p2,
      marginVertical: theme.spacing.margin.m4,
      fontFamily: 'monospace',
    },
    table: {
      borderWidth: 1,
      borderColor: theme.color.borderDefault,
      borderRadius: theme.spacing.radius.r2,
      backgroundColor: theme.color.background2,
      marginVertical: theme.spacing.margin.m2,
      overflow: 'hidden' as 'hidden',
      borderCollapse: 'separate' as 'separate',
      borderSpacing: 0,
    },
    thead: {
      backgroundColor: theme.color.background3,
      margin: 0,
      padding: 0,
    },
    tbody: {
      backgroundColor: theme.color.background1,
      margin: 0,
      padding: 0,
    },
    th: {
      borderRightWidth: 1,
      borderBottomWidth: 1,
      borderColor: theme.color.borderDefault,
      backgroundColor: theme.color.background3,
      padding: theme.spacing.padding.p2,
      fontWeight: 'bold',
      color: bubbleStyle?.textStyle?.color || theme.color.receiveBubbleText,
      fontFamily: bubbleStyle?.textStyle?.fontFamily || theme.typography.body.regular.fontFamily,
      fontSize: bubbleStyle?.textStyle?.fontSize || theme.typography.body.regular.fontSize,
      margin: 0,
      borderTopWidth: 0,
      borderLeftWidth: 0,
    },
    td: {
      borderRightWidth: 1,
      borderBottomWidth: 1,
      borderColor: theme.color.borderDefault,
      backgroundColor: theme.color.background1,
      padding: theme.spacing.padding.p2,
      color: bubbleStyle?.textStyle?.color || theme.color.receiveBubbleText,
      fontFamily: bubbleStyle?.textStyle?.fontFamily || theme.typography.body.regular.fontFamily,
      fontSize: bubbleStyle?.textStyle?.fontSize || theme.typography.body.regular.fontSize,
      margin: 0,
      borderTopWidth: 0,
      borderLeftWidth: 0,
    },
    tr: {
      borderBottomWidth: 0,
      margin: 0,
      padding: 0,
    },
    heading1: {
      fontWeight: '700' as '700',
      fontSize: (bubbleStyle?.textStyle?.fontSize || theme.typography.body.regular.fontSize) * 1.6,
      color: bubbleStyle?.textStyle?.color || theme.color.receiveBubbleText,
      fontFamily: bubbleStyle?.textStyle?.fontFamily || theme.typography.body.regular.fontFamily,
      marginVertical: theme.spacing.margin.m2,
    },
    heading2: {
      fontWeight: '700' as '700',
      fontSize: (bubbleStyle?.textStyle?.fontSize || theme.typography.body.regular.fontSize) * 1.4,
      color: bubbleStyle?.textStyle?.color || theme.color.receiveBubbleText,
      fontFamily: bubbleStyle?.textStyle?.fontFamily || theme.typography.body.regular.fontFamily,
      marginVertical: theme.spacing.margin.m2,
    },
    heading3: {
      fontWeight: '700' as '700',
      fontSize: (bubbleStyle?.textStyle?.fontSize || theme.typography.body.regular.fontSize) * 1.2,
      color: bubbleStyle?.textStyle?.color || theme.color.receiveBubbleText,
      fontFamily: bubbleStyle?.textStyle?.fontFamily || theme.typography.body.regular.fontFamily,
      marginVertical: theme.spacing.margin.m1,
    },
    heading4: {
      fontWeight: '700' as '700',
      fontSize: (bubbleStyle?.textStyle?.fontSize || theme.typography.body.regular.fontSize) * 1.1,
      color: bubbleStyle?.textStyle?.color || theme.color.receiveBubbleText,
      fontFamily: bubbleStyle?.textStyle?.fontFamily || theme.typography.body.regular.fontFamily,
      marginVertical: theme.spacing.margin.m1,
    },
    heading5: {
      fontWeight: '700' as '700',
      fontSize: bubbleStyle?.textStyle?.fontSize || theme.typography.body.regular.fontSize,
      color: bubbleStyle?.textStyle?.color || theme.color.receiveBubbleText,
      fontFamily: bubbleStyle?.textStyle?.fontFamily || theme.typography.body.regular.fontFamily,
      marginVertical: theme.spacing.margin.m1,
    },
    heading6: {
      fontWeight: '700' as '700',
      fontSize: (bubbleStyle?.textStyle?.fontSize || theme.typography.body.regular.fontSize) * 0.9,
      color: bubbleStyle?.textStyle?.color || theme.color.receiveBubbleText,
      fontFamily: bubbleStyle?.textStyle?.fontFamily || theme.typography.body.regular.fontFamily,
      marginVertical: theme.spacing.margin.m1,
    },
    strong: {
      fontWeight: '700' as '700',
      color: bubbleStyle?.textStyle?.color || theme.color.receiveBubbleText,
    },
    em: {
      fontStyle: 'italic' as 'italic',
      color: bubbleStyle?.textStyle?.color || theme.color.receiveBubbleText,
    },
    blockquote: {
      borderLeftWidth: 3,
      borderLeftColor: theme.color.borderDefault,
      paddingLeft: theme.spacing.padding.p2,
      color: theme.color.textSecondary,
    },
    link: {
      underlineColor: theme.color.textHighlight,
      color: theme.color.textHighlight,
      borderRadius: theme.spacing.radius.r1,
      paddingHorizontal: theme.spacing.padding.p0_5,
      paddingVertical: theme.spacing.padding.p0_5,
      textDecorationLine: 'underline' as 'underline',
    },
  }), [bubbleStyle?.textStyle, theme]);

  const MemoMarkdown = useMemo(() => {
    return (
      <View style={styles.container}>
        <Markdown style={markdownStyles} mergeStyle={true}>
          {text.trim()}
        </Markdown>
      </View>
    )
  }, [text, markdownStyles, styles]);

  return MemoMarkdown;
};

export default CometChatAIAssistantMessageBubble;