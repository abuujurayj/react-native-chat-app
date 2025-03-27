import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  EmitterSubscription,
  ImageBackground,
  ImageSourcePropType,
  ImageStyle,
  NativeEventEmitter,
  NativeModules,
  Platform,
  Pressable,
  View,
  ViewStyle,
} from "react-native";
import { CometChatVideoPlayer } from "../CometChatVideoPlayer";
import { defaultThumbnail } from "./resources";
import { Icon } from "../../icons/Icon";
import { CommonUtils } from "../../utils/CommonUtils";

const { FileManager } = NativeModules;
const eventEmitter = new NativeEventEmitter(FileManager);
let statusListener: EmitterSubscription;
export interface CometChatVideoBubbleInterface {
  /**
   * url for video
   */
  videoUrl: string;
  /**
   * thumbnail url for bubble
   */
  thumbnailUrl?: ImageSourcePropType;
  /**
   * placeholder image
   */
  placeholderImage?: ImageSourcePropType;

  /**
   * custom play icon
   */
  playIcon?: JSX.Element | ImageSourcePropType;
  /**
   * callback function to be executed when play button clicked.
   * function will receive an videoUrl as parameter.
   */
  onPress?: Function;
  imageStyle?: ImageStyle;
  playIconStyle?: ImageStyle;
  playIconContainerStyle?: ViewStyle;
}

export const CometChatVideoBubble = (props: CometChatVideoBubbleInterface) => {
  const {
    videoUrl,
    thumbnailUrl,
    placeholderImage,
    playIcon,
    playIconStyle,
    onPress,
    playIconContainerStyle,
    imageStyle,
  } = props;

  const [isOpening, setOpening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVideoPlayerVisible, setIsVideoPlayerVisible] = useState(false);
  const [imageSource, setImageSource] = useState<ImageSourcePropType>();

  // Prefetch thumbnail logic on mount
  useEffect(() => {
    if (thumbnailUrl && typeof thumbnailUrl === "object" && "uri" in thumbnailUrl) {
      CommonUtils.prefetchThumbnail(thumbnailUrl.uri!).then((success) => {
        if (success) {
          setImageSource(thumbnailUrl);
        } else {
          setImageSource(placeholderImage ?? defaultThumbnail);
        }
      });
    } else {
      setImageSource(placeholderImage ?? defaultThumbnail);
    }
  }, [thumbnailUrl, placeholderImage]);

  const playVideo = () => {
    if (isOpening) {
      return;
    }

    if (onPress) {
      onPress(videoUrl);
      return;
    }

    if (!videoUrl) return;
    setIsLoading(true);
    setIsVideoPlayerVisible(true);
  };

  useEffect(() => {
    statusListener = eventEmitter.addListener("status", (data) => {
      if (data["url"] == videoUrl && data["state"] == "downloading") {
        setOpening(true);
      }
      if (data["url"] == videoUrl && data["state"] == "opening") {
        setOpening(false);
      }
    });

    return () => {
      statusListener.remove();
    };
  }, []);

  const pressTime = useRef<number | null>(0);

  // const handleTouchStart = () => {
  //   pressTime.current = Date.now();
  // };

  // const handleTouchEnd = () => {
  //   if (pressTime.current === null && Platform.OS === "ios") return;
  //   const endTime = Date.now();
  //   const pressDuration = endTime - pressTime.current!;
  //   if (pressDuration < 500) {
  //     playVideo();
  //   }
  // };

  // const onTouchMove = () => {
  //   if (Platform.OS === "ios") {
  //     pressTime.current = null;
  //   }
  // };

  return (
    <>
      <CometChatVideoPlayer
        videoUri={videoUrl}
        isVisible={isVideoPlayerVisible}
        onClose={() => {
          setIsLoading(false);
          setIsVideoPlayerVisible(false);
        }}
        onLoad={() => setIsLoading(false)}
      />
      <ImageBackground source={imageSource} resizeMode={"cover"} style={imageStyle}>
        <Pressable
          onPress={() => playVideo()}
          style={{ height: "100%", width: "100%", alignItems: "center", justifyContent: "center" }}
        >
          <View>
            {isLoading ? (
              <ActivityIndicator
                size={typeof playIconStyle?.height === "number" ? playIconStyle.height : "large"}
                color={playIconStyle?.tintColor}
              />
            ) : (
              <Icon
                name='play-arrow-fill'
                height={playIconStyle?.height}
                width={playIconStyle?.width}
                icon={playIcon}
                imageStyle={playIconStyle}
                color={playIconStyle?.tintColor}
              ></Icon>
            )}
          </View>
        </Pressable>
      </ImageBackground>
    </>
  );
};
