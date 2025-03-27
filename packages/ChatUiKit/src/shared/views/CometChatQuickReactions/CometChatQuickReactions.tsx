import React from "react";
import { ImageSourcePropType, Text, TouchableOpacity, View } from "react-native";
import { CometChatTheme } from "../../../theme/type";
import { useTheme } from "../../../theme";
import { Icon } from "../../icons/Icon";

export const CometChatQuickReactions = (props: {
  quickReactions?: [string, string?, string?, string?, string?];
  style?: CometChatTheme["quickReactionStyle"];
  onReactionPress?: (emoji: string) => void;
  onAddReactionPress?: () => void;
  addReactionUrl?: ImageSourcePropType;
}) => {
  const { quickReactions, style, onReactionPress, onAddReactionPress, addReactionUrl } = props;
  const theme = useTheme();

  function getEmojis() {
    let defaultEmojis = (Array.isArray(quickReactions) && quickReactions) || [
      "👍",
      "❤️",
      "😂",
      "😢",
      "🙏",
    ];
    return defaultEmojis;
  }

  return (
    <View style={[theme.quickReactionStyle.containerStyle, style?.containerStyle]}>
      {getEmojis().map((item, index) => (
        <TouchableOpacity
          key={index}
          style={[theme.quickReactionStyle.emojiContainerStyle, style?.emojiContainerStyle]}
          onPress={() => onReactionPress && onReactionPress(item!)}
        >
          <Text
            style={[
              { fontSize: 25, color: theme.color.textPrimary },
              { ...theme.typography.heading1.regular },
            ]}
          >
            {item}
          </Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        onPress={() => onAddReactionPress && onAddReactionPress()}
        style={[theme.quickReactionStyle.emojiContainerStyle, style?.emojiContainerStyle]}
      >
        <Icon name='add-reaction' color={theme.color.iconSecondary}></Icon>
      </TouchableOpacity>
    </View>
  );
};
