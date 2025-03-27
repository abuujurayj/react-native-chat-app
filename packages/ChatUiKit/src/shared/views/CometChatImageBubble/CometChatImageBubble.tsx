import React from "react";
import {
  EmitterSubscription,
  ImageSourcePropType,
  ImageStyle,
  NativeEventEmitter,
  NativeModules,
} from "react-native";
import { CometChatImageLoader } from "./CometChatImageLoader";

export interface CometChatImageBubbleInterface {
  /**
   * image url pass as {uri: "dummyUrl"}
   */
  imageUrl: ImageSourcePropType;
  /**
   *
   *
   * @type {ImageSourcePropType}
   * @description thumbnail image
   */
  thumbnailUrl?: ImageSourcePropType;
  /**
   * place holder image
   */
  placeHolderImage?: ImageSourcePropType;
  /**
   * custom logic on touch of image
   */
  onPress?: Function;
  style?: ImageStyle;
  /**
   * resizeMode of image
   * @default "cover"
   */
  resizeMode?: "cover" | "contain" | "stretch" | "repeat" | "center";
}

export const CometChatImageBubble = (props: CometChatImageBubbleInterface) => {
  const { thumbnailUrl, imageUrl, placeHolderImage, style, resizeMode } = props;

  return (
    <>
      <CometChatImageLoader
        imageUrl={imageUrl}
        thumbnailUrl={thumbnailUrl}
        activityIndicatorSize={48}
        activityIndicatorViewStyle={{
          height: style?.height,
          width: style?.width,
          backgroundColor: style?.backgroundColor,
          justifyContent: "center",
          alignItems: "center",
          borderRadius: style?.borderRadius,
        }}
        placeHolderImage={placeHolderImage}
        style={style}
        imageResizeMode={resizeMode || "cover"}
      ></CometChatImageLoader>
    </>
  );
};
