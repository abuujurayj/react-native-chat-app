import React, { useLayoutEffect, useState } from "react";
import { ActivityIndicator, Image, Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { ReactNativeZoomableViewWithGestures } from "../../libs/ImageZoom";
import { Icon } from "../../icons/Icon";

export const ImageViewerModal = ({ imageUrl, isVisible, onClose }: any) => {
  const [downloaded, setDownloaded] = useState(false);
  const insets = useSafeAreaInsets();

  useLayoutEffect(() => {
    // include imageUrl as dep so it re-runs when URL changes
    if (!imageUrl) return;
    Image.prefetch(typeof imageUrl === "string" ? imageUrl : imageUrl.uri).then((res) => {
      setDownloaded(res);
    });
  }, [imageUrl]);

  return (
    <Modal animationType='slide' transparent={false} visible={isVisible} onRequestClose={onClose}>
      {/* keep SafeAreaView so bottom inset is handled too */}
      <SafeAreaView style={styles.centeredView} edges={["bottom"]}>
        <View
          style={[
            styles.header,
            {
              // push header below the notch/status bar
              paddingTop: insets.top,
              height: 60 + insets.top,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.closeButton,
              {
                // respect left inset (very useful on iPhone with rounded corners)
                marginLeft: Math.max(10, insets.left + 6),
              },
            ]}
            onPress={onClose}
          >
            <Icon name='arrow-back-fill' color={"#fff"} height={22} width={22} />
          </TouchableOpacity>
        </View>

        <View style={styles.container}>
          {downloaded ? (
            <View style={styles.imageContainer}>
              <ReactNativeZoomableViewWithGestures onSwipeDown={onClose}>
                <Image source={imageUrl} style={styles.imageStyle} resizeMode='contain' />
              </ReactNativeZoomableViewWithGestures>
            </View>
          ) : (
            <View style={styles.loaderContainer}>
              <ActivityIndicator color={"#fff"} size='large' />
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    backgroundColor: "#000",
  },
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "transparent",
    zIndex: 1000,
    elevation: 50,
    justifyContent: "center",
  },
  imageContainer: {
    flex: 1,
    marginVertical: 60,
  },
  closeButton: {
    height: 44,
    width: 44,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 22,
  },
  imageStyle: {
    width: "100%",
    height: "100%",
  },
});
