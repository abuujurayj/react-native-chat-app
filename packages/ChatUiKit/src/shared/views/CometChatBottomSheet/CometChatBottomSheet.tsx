import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import {
  Animated,
  BackHandler,
  Dimensions,
  Modal,
  View,
  Easing,
  DimensionValue,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useTheme } from "../../../theme";

export interface CometChatBottomSheetInterface {
  children?: any;
  isOpen?: boolean;
  onOpen?: Function;
  onClose?: Function;
  onDismiss?:()=> void; //iOS SPECIFIC
  style?: {
    shadowColor?: string;
    backgroundColor?: string;
    lineColor?: string;
    lineHeight?: number;
    paddingHorizontal?: number;
    borderRadius?: number;
    paddingBottom?: number;
    maxHeight?: DimensionValue;
    minHeight?: DimensionValue;
  };
  scrollEnabled?: boolean;
  /**When rendering FlatList, pass this as true to enable {height: 100%}**/
  doNotOccupyEntireHeight?: boolean;
}

const CometChatBottomSheet = forwardRef((props: CometChatBottomSheetInterface, ref) => {
  const theme = useTheme();
  const {
    style = {
      maxHeight: Dimensions.get("screen").height * 0.9,
      minHeight: 50,
    },
    children = <View />,
    isOpen = true,
    onClose = null,
    scrollEnabled = false,
    doNotOccupyEntireHeight = false,
    onDismiss,
  } = props;

  // Animated value for overlay fade
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const [isModalOpen, setIsModalOpen] = useState(isOpen);

  useEffect(() => {
    setIsModalOpen(isOpen);
  }, [isOpen]);

  // Fade in/out the overlay when isOpen changes
  useEffect(() => {
    if (isOpen) {
      // Fade from 0 -> 0.5
      Animated.timing(overlayAnim, {
        toValue: 0.3,
        duration: 100,
        easing: Easing.ease,
        useNativeDriver: false,
      }).start();
    } else {
      // Immediately reset to 0 if closed
      overlayAnim.setValue(0);
    }
  }, [isOpen, overlayAnim]);

  const togglePanel = () => {
    onClose();
  };

  const onBackPress = () => {
    if (isOpen) {
      togglePanel();
      return true; // prevent default back behavior
    }
    return false;
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", onBackPress);

    return () => {
      backHandler.remove();
    };
  }, [onBackPress]);

  useImperativeHandle(ref, () => {
    return {
      togglePanel,
    };
  });

  return (
    <Modal
      animationType='fade'
      transparent={true}
      hardwareAccelerated={true}
      visible={isModalOpen}
      onRequestClose={togglePanel}
      onDismiss={onDismiss}
    >
      {/* Animated overlay that fades in from transparent to rgba(0,0,0,0.5) */}
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: overlayAnim.interpolate({
            inputRange: [0, 0.2],
            outputRange: ["rgba(0,0,0,0)", "rgba(0,0,0,0.2)"],
          }),
        }}
        onStartShouldSetResponder={() => {
          togglePanel();
          return true;
        }}
      />

      {/* Bottom sheet content */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        enabled={Platform.OS === "ios" ? true : false}
        style={{
          backgroundColor: theme.color.background1,
          paddingTop: 25,
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.37,
          shadowRadius: 7.49,
          elevation: 12,
          paddingHorizontal: 5,
          maxHeight: style.maxHeight,
          minHeight: style.minHeight,
          ...(doNotOccupyEntireHeight ? {} : { height: "100%" }),
        }}
      >
        {scrollEnabled ? (
          <ScrollView
            scrollEnabled={scrollEnabled}
            keyboardShouldPersistTaps='always'
            style={{ flex: 1 }}
          >
            {typeof children === "function" ? children() : children}
          </ScrollView>
        ) : typeof children === "function" ? (
          children()
        ) : (
          children
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
});

export { CometChatBottomSheet };
