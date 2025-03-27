import React from "react";
import {
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { useTheme } from "../../../theme";
import { Icon } from "../../icons/Icon";
import styles from "./styles";

interface HeaderProps {
  titleSeparatorStyle: StyleProp<ViewStyle>;
  selectedCount?: number;
  hideBackButton?: boolean;
  onBack?: () => void;
  AppBarOptions?: React.FC;
  shouldSelect?: boolean;
  hideSubmitButton?: boolean;
  onCancel?: () => void;
  onConfirm?: () => void;
  hideSearch?: boolean;
  searchHandler?: (text: string) => void;
  searchInput?: string;
  onSubmitEditing?: () => void;
  backButtonIcon?: ImageSourcePropType | JSX.Element;
  backButtonIconStyle?: ImageStyle;
  title?: string;
  titleStyle?: StyleProp<TextStyle>;
  titleViewStyle?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  searchPlaceholderText?: string;
  selectionIcon?: ImageSourcePropType | JSX.Element;
  cancellationIcon?: ImageSourcePropType | JSX.Element;
  selectionIconStyle?: ImageStyle;
  cancellationIconStyle?: ImageStyle;
  searchStyle?: Partial<{
    textStyle: TextStyle;
    placehodlerTextStyle?: TextStyle;
    containerStyle: ViewStyle;
    icon: ImageSourcePropType | JSX.Element;
    iconStyle: ImageStyle;
  }>;
  backButtonIconContainerStyle?: ViewStyle;
  hideHeader?: boolean;
}

export default function Header({
  selectedCount = 0,
  hideBackButton = true,
  onBack = () => {},
  AppBarOptions,
  shouldSelect = false,
  hideSubmitButton = false,
  onCancel = () => {},
  onConfirm = () => {},
  hideSearch = false,
  searchHandler = () => {},
  searchInput = "",
  onSubmitEditing = () => {},
  backButtonIcon,
  backButtonIconStyle = {},
  title = "",
  titleStyle = {},
  titleViewStyle,
  containerStyle,
  searchPlaceholderText = "Search",
  selectionIcon,
  selectionIconStyle,
  cancellationIcon,
  cancellationIconStyle,
  titleSeparatorStyle,
  searchStyle,
  hideHeader = false,
  backButtonIconContainerStyle = { marginLeft: 10 },
}: HeaderProps) {
  const theme = useTheme();
  return (
    <View style={[styles.listBaseHeaderStyle, containerStyle]}>
      {!hideHeader && (
        <View style={styles.upperContainer}>
          <View style={titleSeparatorStyle ?? { flexDirection: "row" }}>
            {/* If not in selection mode, show back button and title */}
            {!shouldSelect && (!hideBackButton || title.length !== 0) && (
              <View style={styles.headerLeftContainer}>
                {!hideBackButton && (
                  <TouchableOpacity onPress={onBack}>
                    <Icon
                      containerStyle={backButtonIconContainerStyle}
                      name='arrow-back-fill'
                      size={backButtonIconStyle.width}
                      height={backButtonIconStyle.height}
                      width={backButtonIconStyle.width}
                      color={backButtonIconStyle.tintColor}
                      icon={backButtonIcon}
                      imageStyle={backButtonIconStyle}
                    />
                  </TouchableOpacity>
                )}
                {title.length !== 0 && (
                  <View style={titleViewStyle}>
                    <Text
                      ellipsizeMode='tail'
                      numberOfLines={1}
                      style={[{ color: theme.color.textPrimary }, titleStyle]}
                    >
                      {title}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* If in selection mode, show cancel button and selected count */}
            {shouldSelect && (
              <View
                style={[
                  { paddingHorizontal: theme.spacing.spacing.s4 },
                  styles.headerLeftContainer,
                ]}
              >
                <TouchableOpacity onPress={onCancel}>
                  <Icon
                    name='close'
                    size={cancellationIconStyle?.width || 24}
                    height={cancellationIconStyle?.height || 24}
                    width={cancellationIconStyle?.width || 24}
                    color={cancellationIconStyle?.tintColor || theme.color.iconPrimary}
                    icon={cancellationIcon}
                    imageStyle={cancellationIconStyle}
                  />
                </TouchableOpacity>
                <Text
                  style={[styles.selectedCountText, titleStyle, theme.typography.heading2.medium]}
                >
                  {selectedCount}
                </Text>
              </View>
            )}

            {/* AppBar Options or Tick Icon */}
            <View style={styles.headerRightContainer}>
                {!shouldSelect && AppBarOptions && <AppBarOptions />}
                { selectedCount > 0 && shouldSelect && !hideSubmitButton && (
                  <TouchableOpacity onPress={onConfirm} style={{ paddingHorizontal: 20 }}>
                    <Icon
                      name='list-item-check'
                      size={selectionIconStyle?.width || 24}
                      height={selectionIconStyle?.height || 24}
                      width={selectionIconStyle?.width || 24}
                      color={selectionIconStyle?.tintColor || theme.color.iconPrimary}
                      icon={selectionIcon}
                      imageStyle={selectionIconStyle}
                    />
                  </TouchableOpacity>
                )}
              </View>
          </View>
        </View>
      )}

      {/* Search Box */}
      {!hideSearch && (
        <View
          style={[
            {
              backgroundColor: theme.color.background3,
              borderRadius: theme.spacing.radius.max,
              paddingHorizontal: theme.spacing.spacing.s3,
              marginVertical: theme.spacing.spacing.s2,
              gap: theme.spacing.spacing.s1,
            },
            searchStyle?.containerStyle,
          ]}
        >
          <Icon
            name='search-fill'
            size={searchStyle?.iconStyle?.width || 24}
            height={searchStyle?.iconStyle?.height || 24}
            width={searchStyle?.iconStyle?.width || 24}
            color={searchStyle?.iconStyle?.tintColor || theme.color.iconSecondary}
            icon={searchStyle?.icon}
            imageStyle={searchStyle?.iconStyle}
          />

          <TextInput
            placeholder={searchPlaceholderText}
            placeholderTextColor={
              searchStyle?.placehodlerTextStyle?.color || theme.color.textTertiary
            }
            onChangeText={searchHandler}
            returnKeyType="search"
            value={searchInput}
            numberOfLines={1}
            style={[
              {
                flex: 1,
                color: theme.color.textPrimary,
                ...theme.typography.heading4.regular,
              },
              searchStyle?.textStyle,
            ]}
            onSubmitEditing={onSubmitEditing}
          />
        </View>
      )}
    </View>
  );
}
