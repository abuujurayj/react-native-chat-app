import React, { useCallback, useMemo } from "react";
import { Image, ImageSourcePropType, Text, View } from "react-native";
import { useCompTheme, useTheme } from "../../../theme/hook";
import { CometChatTheme } from "../../../theme/type";
import { deepMerge } from "../../helper/helperFunctions";

interface CometChatAvatarProps {
  image?: ImageSourcePropType;
  name: string;
  style?: CometChatTheme["avatarStyle"];
}

export const CometChatAvatar = (props: CometChatAvatarProps) => {
  const theme = useTheme();
  const compTheme = useCompTheme();

  const { image, name, style = {} } = props;

  const avatarStyle = useMemo(() => {
    return deepMerge(theme.avatarStyle, compTheme.avatarStyle ?? {}, style);
  }, [theme.avatarStyle, style, compTheme.avatarStyle]);

  const getImageView = useCallback(() => {
    const imageSource = typeof image === "string" ? { uri: image } : image;
    if (
      (typeof imageSource === "object" &&
        "uri" in imageSource &&
        typeof imageSource.uri === "string") ||
      typeof imageSource === "number"
    ) {
      return <Image source={imageSource} style={[avatarStyle.imageStyle]} />;
    }
    return <Text style={[avatarStyle.textStyle]}>{name?.substring(0, 2).toUpperCase()}</Text>;
  }, [image, name, avatarStyle.imageStyle, avatarStyle.textStyle]);

  return <View style={[avatarStyle.containerStyle]}>{getImageView()}</View>;
};
