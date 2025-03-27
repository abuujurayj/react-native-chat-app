import React, { useEffect, useMemo, useRef } from "react";
import {
  ActivityIndicator,
  EmitterSubscription,
  ImageSourcePropType,
  ImageStyle,
  NativeEventEmitter,
  NativeModules,
  NativeSyntheticEvent,
  NativeTouchEvent,
  Platform,
  Text,
  TextStyle,
  View,
} from "react-native";
import { Icon } from "../../icons/Icon";
import { useTheme } from "../../../theme";
import { getFileTypeIcon } from "../../constants/UIKitConstants";

const { FileManager } = NativeModules;
const eventEmitter = new NativeEventEmitter(FileManager);

export interface CometChatFileBubbleInterface {
  /**
   * url of file
   */
  fileUrl: string;
  /**
   * file title
   */
  title: string;
  /**
   * description for file
   */
  subtitle?: string;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  downloadIcon?: ImageSourcePropType | JSX.Element;
  downloadIconStyle?: ImageStyle;
}

export const CometChatFileBubble = ({
  fileUrl,
  title,
  titleStyle,
  subtitleStyle,
  subtitle,
  downloadIcon,
  downloadIconStyle,
}: CometChatFileBubbleInterface) => {
  const [processing, setProcessing] = React.useState(false);
  const [fileExists, setFileExists] = React.useState(false); // State to track if the file exists
  const theme = useTheme();
  let listener: EmitterSubscription;

  /********Android Specific********/
  const downloadIdRef = useRef(0);
  /********************************/
  const openFileAfterDownloading = useRef(false);

  useEffect(() => {
    checkFileExists();

    if (Platform.OS == "android") {
      listener = eventEmitter.addListener("downloadComplete", (data: { downloadId: number }) => {
        if (data.downloadId && downloadIdRef.current && data.downloadId == downloadIdRef.current) {
          setProcessing(false);
          setFileExists(true);
          if (openFileAfterDownloading.current) {
            openFile();
            openFileAfterDownloading.current = false;
          }
        }
      });
    }
    return () => {
      if (Platform.OS == "android") {
        listener.remove();
      }
    };
  }, [fileUrl]);

  const checkFileExists = async (downloadAndOpenFile = false) => {
    if (!fileUrl) return;

    const fileName = getFileName();
    setProcessing(true);
    FileManager.doesFileExist(fileName, (result: string) => {
      setProcessing(false);
      if (JSON.parse(result).exists) {
        setFileExists(true);
        if (downloadAndOpenFile) {
          openFile();
          openFileAfterDownloading.current = false;
        }
      } else {
        if (downloadAndOpenFile) {
          openFileAfterDownloading.current = true;
          downloadFile();
        }
      }
    });
  };

  const downloadFile = () => {
    if (processing || fileExists) return; // Do not process if file already exists

    if (!fileUrl) return;

    setProcessing(true);
    FileManager.checkAndDownload(fileUrl, getFileName(), (result: string) => {
      if (Platform.OS == "ios") {
        let parsedResult = JSON.parse(result);
        if (parsedResult.success == true) {
          setProcessing(false);
          setFileExists(true);
        }
        if (openFileAfterDownloading.current) {
          openFile();
          openFileAfterDownloading.current = false;
        }
      } else if (Platform.OS == "android") {
        downloadIdRef.current = JSON.parse(result).downloadId;
      }
    });
  };

  const openFile = () => {
    if (processing) return;

    if (!fileUrl) return;

    setProcessing(true);
    FileManager.openFile(fileUrl, getFileName(), (isOpened: string) => {
      setProcessing(false);
    });
  };

  const getFileName = () => {
    return fileUrl.substring(fileUrl.lastIndexOf("/") + 1).replace(" ", "_");
  };

  const wrapperPressTime = useRef<number | null>(0);
  //toDoLater
  const viewProps = useMemo(() => {
    return Platform.OS === "ios"
      ? {
          onTouchStart: () => {
            wrapperPressTime.current = Date.now();
          },
          onTouchMove: () => {
            wrapperPressTime.current = null;
          },
          onTouchEnd: () => {
            if (wrapperPressTime.current === null) return;
            const endTime = Date.now();
            const pressDuration = endTime - wrapperPressTime.current;
            if (pressDuration < 500) {
              checkFileExists(true);
            }
          },
        }
      : {};
  }, []);

  const pressTimeOnAndroid = useRef(0);
  let viewPropsForAndroid = useMemo(() => {
    return Platform.OS === "android"
      ? {
          onTouchStart: () => {
            pressTimeOnAndroid.current = Date.now();
          },
          onTouchEnd: () => {
            const endTime = Date.now();
            const pressDuration = endTime - pressTimeOnAndroid.current;
            if (pressDuration < 500) {
              checkFileExists(true);
            }
          },
        }
      : {};
  }, []);

  const shouldDownload = (e: NativeSyntheticEvent<NativeTouchEvent>) => {
    e.stopPropagation();
    setProcessing(true);
    downloadFile();
  };

  return (
    <View {...viewProps} style={{ flexDirection: "row", gap: 8 }}>
      <View {...viewPropsForAndroid} style={{ height: 32, width: 32 }}>
        <Icon name={getFileTypeIcon(title)} size={32}></Icon>
      </View>
      <View
        {...viewPropsForAndroid}
        style={{ flexDirection: "column", flexGrow: 1, flexShrink: 1 }}
      >
        {title && (
          <Text numberOfLines={1} ellipsizeMode={"tail"} style={[titleStyle]}>
            {title}
          </Text>
        )}
        {subtitle && (
          <Text numberOfLines={1} ellipsizeMode={"tail"} style={subtitleStyle}>
            {subtitle}
          </Text>
        )}
      </View>
      {/* Show download button only if file does not exist */}
      {/* {!processing && !fileExists && (
        <View
          {...viewPropsForAndroid}
          onTouchEnd={shouldDownload}
          style={{ padding: 4, paddingBottom: 0 }}
        >
          <Icon
            name='download'
            height={downloadIconStyle?.height}
            width={downloadIconStyle?.width}
            icon={downloadIcon}
            imageStyle={downloadIconStyle}
            color={downloadIconStyle?.tintColor}
          />
        </View>
      )} */}
      {processing && !fileExists && (
        <ActivityIndicator color={downloadIconStyle?.tintColor}></ActivityIndicator>
      )}
    </View>
  );
};
