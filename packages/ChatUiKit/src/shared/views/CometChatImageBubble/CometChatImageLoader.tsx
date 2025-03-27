import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  View,
  StyleSheet,
  Platform,
  ImageSourcePropType,
  ImageStyle,
  ViewStyle,
} from "react-native";
import { ImageViewerModal } from "../CometChatImageViewerModal";
import { CommonUtils } from "../../utils/CommonUtils";

export interface CometChatImageLoaderPropType {
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
  imageResizeMode?: "cover" | "contain" | "stretch" | "repeat" | "center";

  activityIndicatorSize: number;

  activityIndicatorViewStyle: ViewStyle;
}

export const CometChatImageLoader = (props: CometChatImageLoaderPropType) => {
  const {
    thumbnailUrl,
    imageUrl,
    style,
    imageResizeMode,
    activityIndicatorSize,
    activityIndicatorViewStyle,
  } = props;

  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [imageSource, setImageSource] = useState<ImageSourcePropType>();

  const pressTime = useRef<number | null>(0);

  const handleTouchStart = () => {
    pressTime.current = Date.now();
  };

  const handleTouchEnd = () => {
    if (pressTime.current === null && Platform.OS === "ios") return;
    const endTime = Date.now();
    const pressDuration = endTime - pressTime.current!;
    if (pressDuration < 500) {
      setIsVisible(true);
    }
  };

  const onTouchMove = () => {
    if (Platform.OS === "ios") {
      pressTime.current = null;
    }
  };


  useEffect(() => {
    if (thumbnailUrl && typeof thumbnailUrl === "object" && "uri" in thumbnailUrl) {
      CommonUtils.prefetchThumbnail(thumbnailUrl.uri!).then((success: any) => {
        if (success) {
          setImageSource(thumbnailUrl);
        } else {
          setImageSource(imageUrl); // Fallback to original imageUrl if prefetch fails
        }
      });
    } else {
      setImageSource(imageUrl); // No thumbnail available, fallback to imageUrl
    }
  }, [thumbnailUrl, imageUrl]);

  return (
    <>
      {isVisible && (
        <ImageViewerModal
          imageUrl={imageUrl}
          isVisible={isVisible}
          onClose={() => {
            setIsVisible(false);
          }}
        />
      )}
      <View
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={onTouchMove}
        style={{
          position: "relative",
          justifyContent: "center",
          alignItems: "center",
          height: style?.height,
          width: style?.width,
        }}
      >
        {/* Image (initially hidden until loaded) */}
        <Image
          resizeMode={imageResizeMode || "cover"}
          source={imageSource}
          style={[styles.image, style]}
          onLoad={() => setIsLoaded(true)}
        />

        {/* Activity Indicator (remains visible until image is loaded) */}
        {!isLoaded && (
          <ActivityIndicator
            size={activityIndicatorSize || "large"}
            style={[styles.loader, activityIndicatorViewStyle]}
          />
        )}
      </View>
    </>
  );
};

// Default styles
const styles = StyleSheet.create({
  container: {
    position: "relative", // Use relative position for the container
    justifyContent: "center",
    alignItems: "center",
  },
  loader: {
    position: "absolute", // Keep the loader in the center of the View
    zIndex: 1, // Ensure it's above the image until the image loads
  },
  image: {
    position: "absolute", // The image stays in place while loading
  },
});
