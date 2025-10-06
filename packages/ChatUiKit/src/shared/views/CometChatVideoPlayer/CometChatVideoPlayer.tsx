import React, { useState, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Video from "react-native-video";
import { Icon } from "../../icons/Icon";

/**
 * Props for the CometChatVideoPlayer component.
 */
export interface CometChatVideoPlayerProps {
  /**
   * URI of the video to play.
   */
  videoUri: string;
  /**
   * Flag indicating whether the video player is visible.
   */
  isVisible: boolean;
  /**
   * Callback function invoked when the video player is closed.
   */
  onClose: () => void;
  /**
   * Callback function invoked when the video has loaded.
   */
  onLoad: () => void;
  /**
   * Optional color for the loading icon.
   */
  loadingIconColor?: string;
}

export const CometChatVideoPlayer = (props: CometChatVideoPlayerProps) => {
  const { videoUri, isVisible, onClose, onLoad, loadingIconColor } = props;
  const [isPaused, setPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showCloseButton, setShowCloseButton] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Handle closing the video player
  const handleClose = () => {
    setPaused(true);
    onClose();
  };
  const handleLoadStart = () => {
    setIsLoading(true);
    setPaused(false);
  };

  const handleBuffer = (bufferData: { isBuffering: boolean }) => {
    setIsLoading(bufferData.isBuffering);
  };

  const handleLoad = () => {
    setIsLoading(false);
    onLoad();
  };

  const resetHideTimer = () => {
    // Clear existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // Show close button and set new timer
    setShowCloseButton(true);
    timerRef.current = setTimeout(() => {
      setShowCloseButton(false);
    }, 2500);
  };

  // Handle tap on video area
  const handleVideoTap = () => {
    resetHideTimer();
  };

  // Set up and clean up timers based on visibility
  useEffect(() => {
    if (isVisible) {
      resetHideTimer();
    } else {
      // Clean up on close
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      // Reset to visible state for next open
      setShowCloseButton(true);
    }

    // Clear timer when component unmounts
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isVisible]);

  return (
    <Modal
      animationType='fade'
      presentationStyle='overFullScreen'
      transparent={true}
      visible={isVisible}
      onRequestClose={handleClose}
    >
      <View style={styles.modalBackground}>
        <TouchableWithoutFeedback onPress={handleVideoTap}>
          <View style={styles.playerContainer}>
            <Video
              source={{ uri: videoUri }}
              controls={true}
              resizeMode='contain'
              onLoadStart={handleLoadStart}
              onBuffer={handleBuffer}
              onLoad={handleLoad}
              onError={(e) => console.warn("Video Error: ", e?.error)}
              paused={isPaused}
              style={styles.video}
            />
            {isLoading && (
              <ActivityIndicator
                style={styles.loadingIndicator}
                size='large'
                color={loadingIconColor || "#fff"}
              />
            )}

            {showCloseButton && (
              <TouchableWithoutFeedback onPress={handleClose}>
                <View style={styles.closeButton}>
                  <Icon name='close' size={22} color={"#fff"} />
                </View>
              </TouchableWithoutFeedback>
            )}
          </View>
        </TouchableWithoutFeedback>
      </View>
    </Modal>
  );
};

const { width, height } = Dimensions.get("window");
const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  playerContainer: {
    width: width,
    height: height * 0.96,
    backgroundColor: "black",
    borderRadius: 10,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  video: {
    width: "100%",
    height: "100%",
  },
  loadingIndicator: {
    position: "absolute",
    alignSelf: "center",
    top: "50%",
  },
  closeButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 15,
    right: 10,
    width: 30,
    height: 30,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
});