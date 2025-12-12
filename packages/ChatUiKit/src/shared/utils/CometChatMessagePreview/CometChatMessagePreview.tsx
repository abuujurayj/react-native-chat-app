import React, { JSX } from "react";
import { View, Text, TouchableOpacity, Image, StyleProp, ViewStyle } from "react-native";
import { CometChat } from "@cometchat/chat-sdk-react-native";
import closeIcon from "./resources/close.png";
import { useTheme } from "../../../theme";
import { Styles } from "./style";
import { getCometChatTranslation } from "../../resources/CometChatLocalizeNew/LocalizationManager";
import { Icon } from "../../icons/Icon";
import { CometChatUIKit } from "../../CometChatUiKit";

const t = getCometChatTranslation();

/**
 * Props for CometChatMessagePreview component
 */
interface CometChatMessagePreviewProps {
  // Old interface (for backward compatibility)
  messagePreviewTitle?: string;
  messagePreviewSubtitle?: string;
  closeIconURL?: any;
  onCloseClick?: () => void;
  
  // New interface (message-based)
  message?: CometChat.BaseMessage;
  theme?: any;
  showCloseIcon?: boolean;
  style?: StyleProp<ViewStyle>;
  
  // Icon support
  subtitleIcon?: JSX.Element;
  
  // Title style override
  titleStyle?: any;
  
  // Deleted message indicator
  isDeletedMessage?: boolean;
}

/**
 *
 * CometChatMessagePreview
 *
 */
const CometChatMessagePreview = (props: CometChatMessagePreviewProps) => {
  const {
    messagePreviewTitle,
    messagePreviewSubtitle,
    closeIconURL,
    onCloseClick,
    message,
    theme: propTheme,
    showCloseIcon = false,
    style,
    subtitleIcon,
    titleStyle,
    isDeletedMessage = false
  } = props;
  
  const theme = useTheme();
  const finalTheme = propTheme || theme;

  // Helper function to get message preview title (sender name)
  const getMessagePreviewTitle = (): string => {
    if (messagePreviewTitle) return messagePreviewTitle;
    
    if (!message) return "";
    
    try {
      if (message && typeof message.getSender === 'function') {
        const sender = message.getSender();
        if (sender && typeof sender.getName === 'function') {
          return sender.getName() || "";
        }
      }
      // Fallback for cases where getSender is not available
      if (message && (message as any).sender && (message as any).sender.name) {
        return (message as any).sender.name;
      }
    } catch (error) {
      console.warn("Error getting message sender:", error);
    }
    return "";
  };

  // Helper function to get message preview subtitle/content
  const getMessagePreviewSubtitle = (): string => {
    if (messagePreviewSubtitle) return messagePreviewSubtitle;
    
    if (!message) return "";
    

    if (props.isDeletedMessage) {
      return t("MESSAGE_IS_DELETED") || "Message deleted";
    }
    
    try {
      const messageType = typeof message.getType === 'function' ? message.getType() : (message as any).type;
      const messageCategory = typeof message.getCategory === 'function' ? message.getCategory() : (message as any).category;

      if (messageCategory === CometChat.CATEGORY_MESSAGE) {
        switch (messageType) {
          case CometChat.MESSAGE_TYPE.TEXT:
            const textMessage = message as CometChat.TextMessage;
            let text = (typeof textMessage.getText === 'function' ? textMessage.getText() : (textMessage as any).text) || "";
            try {
              if (textMessage.getMentionedUsers && textMessage.getMentionedUsers().length > 0) {
                const mentionedUsers = textMessage.getMentionedUsers();
                const uidMap = new Map();
                mentionedUsers.forEach(user => {
                  uidMap.set(user.getUid(), user.getName());
                });
                text = text.replace(/<@uid:(.*?)>/g, (match: string, uid: string): string => {
                  if (uidMap.has(uid)) {
                    return `@${uidMap.get(uid)}`;
                  }
                  return match;
                });
              }
              text = text.replace(/<@all:(.*?)>/g, (match: string, alias: string): string => {
                return `@${alias}`;
              });
              
            } catch (e) {
              console.warn("Error formatting mentions in preview:", e);
            }

            // Truncate long text messages
            return text.length > 50 ? `${text.substring(0, 50)}...` : text;
          
          case CometChat.MESSAGE_TYPE.IMAGE:
            const imageMessage = message as CometChat.MediaMessage;
            const imageAttachment = typeof imageMessage.getAttachment === 'function' ? imageMessage.getAttachment() : (imageMessage as any).attachment;
            return imageAttachment?.getName?.() || imageAttachment?.name || t("MESSAGE_IMAGE") || "Image";
          
          case CometChat.MESSAGE_TYPE.VIDEO:
            const videoMessage = message as CometChat.MediaMessage;
            const videoAttachment = typeof videoMessage.getAttachment === 'function' ? videoMessage.getAttachment() : (videoMessage as any).attachment;
            return videoAttachment?.getName?.() || videoAttachment?.name || t("MESSAGE_VIDEO") || "Video";
          
          case CometChat.MESSAGE_TYPE.AUDIO:
            const audioMessage = message as CometChat.MediaMessage;
            const audioAttachment = typeof audioMessage.getAttachment === 'function' ? audioMessage.getAttachment() : (audioMessage as any).attachment;
            return audioAttachment?.getName?.() || audioAttachment?.name || t("MESSAGE_AUDIO") || "Audio";
          
          case CometChat.MESSAGE_TYPE.FILE:
            const fileMessage = message as CometChat.MediaMessage;
            const fileAttachment = typeof fileMessage.getAttachment === 'function' ? fileMessage.getAttachment() : (fileMessage as any).attachment;
            return fileAttachment?.getName?.() || fileAttachment?.name || t("MESSAGE_FILE") || "File";
          
          default:
            return messageType || t("MESSAGE") || "Message";
        }
      } else if (messageCategory === CometChat.CATEGORY_CUSTOM) {
        // Handle custom message types with proper formatting
        
        if (messageType === "extension_sticker") {
          return "Sticker";
        } else if (messageType === "extension_collaborative_whiteboard" || messageType === "extension_whiteboard") {
          return "Collaborative Whiteboard";
        } else if (messageType === "extension_document") {
          return "Document";
        } else if (messageType === "extension_poll") {
          return "Poll";
        } else if (messageType === "meeting") {
          return "Meeting";
        } else if (messageType === "extension_location") {
          return "Location";
        } else {
          // Convert snake_case or camelCase to Title Case, but remove "extension_" prefix
          if (messageType) {
            let formattedType = messageType;
            
            // Remove "extension_" prefix if present
            if (formattedType.startsWith('extension_')) {
              formattedType = formattedType.replace('extension_', '');
            }
            
            return formattedType
              .replace(/[_-]/g, ' ')
              .replace(/([a-z])([A-Z])/g, '$1 $2')
              .split(' ')
              .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join(' ');
          }
          return t("CUSTOM_MESSAGE") || "Custom Message";
        }
      } else if (messageCategory === CometChat.CATEGORY_ACTION) {
        return t("ACTION_MESSAGE") || "Action";
      }
      
      return t("MESSAGE") || "Message";
    } catch (error) {
      console.warn("Error getting message preview subtitle:", error);
      return t("MESSAGE") || "Message";
    }
  };

  // Helper function to get auto-generated icon for attachment types
  const getAutoIcon = (): JSX.Element | null => {
    if (subtitleIcon) return null; // Don't auto-generate if icon is manually provided
    if (!message) {
      return null;
    }
    
    try {
      const messageType = typeof message.getType === 'function' ? message.getType() : (message as any).type;
      const messageCategory = typeof message.getCategory === 'function' ? message.getCategory() : (message as any).category;

      // Use theme colors safely
      const iconColor = finalTheme?.palette?.getAccent600?.() || 
                       finalTheme?.color?.iconSecondary || 
                       finalTheme?.colors?.accent || 
                       "#666666"; // fallback color

      if (messageCategory === CometChat.CATEGORY_MESSAGE) {
        switch (messageType) {
          case CometChat.MESSAGE_TYPE.IMAGE:
            return <Icon name="photo-fill" width={16} height={16} color={iconColor} />;
          case CometChat.MESSAGE_TYPE.VIDEO:
            return <Icon name="videocam-fill" width={16} height={16} color={iconColor} />;
          case CometChat.MESSAGE_TYPE.AUDIO:
            return <Icon name="play-circle-fill" width={16} height={16} color={iconColor} />;
          case CometChat.MESSAGE_TYPE.FILE:
            return <Icon name="description-fill" width={16} height={16} color={iconColor} />;
          default:
        }
      } else if (messageCategory === CometChat.CATEGORY_CUSTOM) {
        // Handle custom message types with appropriate icons
        let iconMessageType = messageType;
        
        // Normalize the message type by removing "extension_" prefix if present
        if (iconMessageType && iconMessageType.startsWith('extension_')) {
          iconMessageType = iconMessageType.replace('extension_', '');
        }
        
        switch (iconMessageType) {
          case "sticker":
            return <Icon name="sticker-fill" width={16} height={16} color={iconColor} />;
          case "collaborative_whiteboard":
          case "whiteboard":
            return <Icon name="collaborative-whiteboard-fill" width={16} height={16} color={iconColor} />;
          case "document":
            return <Icon name="collaborative-document-fill" width={16} height={16} color={iconColor} />;
          case "poll":
            return <Icon name="poll-fill" width={16} height={16} color={iconColor} />;
          case "meeting":
            return <Icon name="videocam-fill" width={16} height={16} color={iconColor} />;
          case "location":
            return <Icon name="location-on-fill" width={16} height={16} color={iconColor} />;
          default:
            return <Icon name="chat-fill" width={16} height={16} color={iconColor} />;
        }
      }
    } catch (error) {
      console.warn("Error getting auto icon:", error);
    }
    
    return null;
  };

  let messageText = getMessagePreviewSubtitle();
  let title = getMessagePreviewTitle();
  let autoIcon = getAutoIcon();

  const shouldShowClose = showCloseIcon || onCloseClick;
  const containerStyle = style ? [Styles(finalTheme).editPreviewContainerStyle, style] : Styles(finalTheme).editPreviewContainerStyle;
  const iconToShow = subtitleIcon || autoIcon;

  return (
    <View style={containerStyle}>
      {/* <View style={Styles(finalTheme).leftBar} /> */}
      <View style={Styles(finalTheme).previewHeadingStyle}>
        <Text style={[Styles(finalTheme).previewTitleStyle, titleStyle]}>{title}</Text>
        {shouldShowClose && (
          <TouchableOpacity
            style={Styles(finalTheme).previewCloseStyle}
            onPress={onCloseClick ?? (() => {})}
          >
            <Icon name='close' width={16} height={16} color={finalTheme.color.textPrimary} />
          </TouchableOpacity>
        )}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: finalTheme?.spacing?.padding?.p1}}>
        {iconToShow && <View>{iconToShow}</View>}
        <Text numberOfLines={1} ellipsizeMode='tail' style={[Styles(finalTheme).previewSubTitleStyle, { flex: 1 }]}>
          {messageText}
        </Text>
      </View>
    </View>
  );
};

export { CometChatMessagePreview };
