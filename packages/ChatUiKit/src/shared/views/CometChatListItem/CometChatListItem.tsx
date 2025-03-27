import React, { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  GestureResponderEvent,
  Image,
  ImageSourcePropType,
  StyleProp,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { useTheme } from "../../../theme";
import { CometChatTheme } from "../../../theme/type";
import { Icon } from "../../icons/Icon";
import { CometChatAvatar } from "../CometChatAvatar";
import {
  CometChatStatusIndicator,
  CometChatStatusIndicatorInterface,
} from "../CometChatStatusIndicator";
import { Style } from "./style";

export interface CometChatListItemInterface {
  id: string | number;
  avatarURL?: ImageSourcePropType;
  avatarName?: string;
  avatarStyle?: CometChatTheme["avatarStyle"];
  title?: string;
  titleStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  statusIndicatorType?: CometChatStatusIndicatorInterface["type"];
  LeadingView?: ReactNode;
  TitleView?: ReactNode;
  SubtitleView?: ReactNode;
  TrailingView?: ReactNode;
  separatorColor?: string;
  onPress?: Function;
  onLongPress?: Function;
  shouldSelect?: boolean;
  headViewContainerStyle?: StyleProp<ViewStyle>;
  trailingViewContainerStyle?: StyleProp<ViewStyle>;
  titleSubtitleContainerStyle?: StyleProp<ViewStyle>;
  selected?: boolean;
}

export const CometChatListItem = React.memo((props: CometChatListItemInterface) => {
  const [translate, setTranslate] = useState(0);
  const theme = useTheme();

  const {
    id,
    avatarURL,
    avatarName,
    title,
    LeadingView,
    SubtitleView,
    TrailingView,
    headViewContainerStyle,
    trailingViewContainerStyle,
    titleSubtitleContainerStyle,
    onPress,
    onLongPress,
    statusIndicatorType,
    titleStyle,
    containerStyle,
    avatarStyle,
    selected = false,
    shouldSelect,
    TitleView,
  } = props;

  let cancelClick = false;

  /**
   * Component to display the avatar with optional selection box
   */
  const AvatarWithStatusView = useCallback(() => {
    return (
      <View style={[{ flexDirection: "row", alignItems: "center" }, headViewContainerStyle]}>
        {shouldSelect && (
          <View
            style={{
              width: 24,
              height: 24,
              borderWidth: 1.6,
              borderColor: theme.color.borderDefault,
              backgroundColor: selected ? theme.color.primary : theme.color.background1,
              borderRadius: 5,
              marginRight: 12,
              justifyContent: "center",
              alignItems: "center",
              zIndex: 2,
            }}
          >
            {selected && (
              <Icon
                name='list-item-check'
                size={16}
                height={16}
                width={16}
                color={theme.color.iconWhite}
              />
            )}
          </View>
        )}
        <CometChatAvatar image={avatarURL} name={avatarName!} style={avatarStyle} />
        <CometChatStatusIndicator type={statusIndicatorType} />
      </View>
    );
  }, [
    avatarURL,
    avatarName,
    statusIndicatorType,
    avatarStyle,
    selected,
    theme.color.primary,
    shouldSelect,
  ]);

  /**
   * Component to display the Title
   */
  const getTitleView = () => {
    if (TitleView) return TitleView;
    return (
      <Text numberOfLines={1} ellipsizeMode='tail' style={titleStyle}>
        {title}
      </Text>
    );
  };

  /**
   * Callback Function when user clicks on the item
   */
  const clickHandler = () => {
    if (!cancelClick) {
      if (onPress && typeof onPress === "function") {
        onPress(id);
      }
    }
  };

  /**
   * Callback Function when user long presses on the item
   */
  const longPressHandler = useCallback(
    (e: GestureResponderEvent) => {
      if (!cancelClick) {
        if (onLongPress && typeof onLongPress === "function") {
          onLongPress(id, e);
        }
      }
    },
    [onLongPress, id]
  );

  /**
   * Component to display the Tail section
   */
  const getTrailingView = () => {
    if (TrailingView)
      return (
        <View style={[Style.tailViewStyle, trailingViewContainerStyle ?? {}]}>{TrailingView}</View>
      );

    return null;
  };

  let ListComponent =
    (onPress && typeof onPress == "function") || (onLongPress && typeof onLongPress == "function")
      ? TouchableOpacity
      : View;
  let listComponentProps =
    (onPress && typeof onPress == "function") || (onLongPress && typeof onLongPress == "function")
      ? {
          activeOpacity: 1,
          onPress: clickHandler,
          onLongPress: longPressHandler,
        }
      : {};

  return (
    <ListComponent
      {...listComponentProps}
      style={[containerStyle, selected && { backgroundColor: theme.color.background4 }]}
    >
      {LeadingView ?? (Boolean(avatarURL || avatarName) && <AvatarWithStatusView />)}
      <View style={[Style.rightContainerStyle]}>
        <View
          style={[
            Style.middleViewStyle,
            { padding: 0, paddingLeft: 0 },
           titleSubtitleContainerStyle ?? {},
          ]}
        >
          {getTitleView()}
          {SubtitleView}
        </View>
        {getTrailingView()}
      </View>
    </ListComponent>
  );
});
