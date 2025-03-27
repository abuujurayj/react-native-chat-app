import { CometChat } from "@cometchat/chat-sdk-react-native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Image,
  ImageSourcePropType,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CometChatAvatar, localize } from "../../shared";
import { CallTypeConstants } from "../../shared/constants/UIKitConstants";
import { CometChatUIEventHandler } from "../../shared/events/CometChatUIEventHandler/CometChatUIEventHandler";
import { CallUIEvents } from "../CallEvents";
import { CallingPackage } from "../CallingPackage";
import { CallUtils } from "../CallUtils";
import { CometChatOutgoingCall, CometChatOutgoingCallInterface } from "../CometChatOutgoingCall";
import { BackIcon } from "./resources";
import { Style } from "./style";
import { Icon } from "../../shared/icons/Icon";
import { useTheme } from "../../theme";
import { DateHelper, dateHelperInstance } from "../../shared/helper/dateHelper";
import { ErrorEmptyView } from "../../shared/views/ErrorEmptyView/ErrorEmptyView";
import { Skeleton } from "./Skeleton";
import { CometChatTheme } from "../../theme/type";
import { deepMerge } from "../../shared/helper/helperFunctions";
import { DeepPartial, ValueOf } from "../../shared/helper/types";

const listenerId = "callEventListener_" + new Date().getTime();
const CometChatCalls = CallingPackage.CometChatCalls;

/**
 * Props for configuring the CometChatCallLogs component.
 *
 * @interface CometChatCallLogsConfigurationInterface
 */
export interface CometChatCallLogsConfigurationInterface {
  /** Custom component to render as the leading view for each call log item */
  LeadingView?: (call?: any) => JSX.Element;
  /** Custom component to render as the title view for each call log item */
  TitleView?: (call?: any) => JSX.Element;
  /** Custom component to render as the subtitle view for each call log item */
  SubtitleView?: (call?: any) => JSX.Element;
  /** Custom component to render as the entire item view for each call log */
  ItemView?: (call?: any) => JSX.Element;
  /** Custom component to render as the trailing view for each call log item */
  TrailingView?: (call?: any) => JSX.Element;
  /** Custom options to render in the AppBar */
  AppBarOptions?: () => JSX.Element;
  /** Builder for custom call log requests */
  callLogRequestBuilder?: any;
  /** Date format pattern for call logs */
  datePattern?: ValueOf<typeof DateHelper.patterns>;
  /** Flag to hide the back button in the header */
  hideBackButton?: boolean;
  /** Custom component to render when the call log list is empty */
  EmptyView?: () => JSX.Element;
  /** Custom component to render in case of an error */
  ErrorView?: (e: CometChat.CometChatException) => JSX.Element;
  /** Custom component to render while loading call logs */
  LoadingView?: () => JSX.Element;
  /** Flag to hide the error view */
  hideError?: boolean;
  /** Callback when the call icon is pressed */
  onCallIconPress?: (item: any) => void;
  /** Callback for handling errors */
  onError?: (e: CometChat.CometChatException) => void;
  /** Callback for when the back button is pressed */
  onBack?: () => void;
  /** Callback for when a call log item is pressed */
  onItemPress?: (prop: { call: any }) => void;
  /** Custom style overrides for the call logs */
  style?: DeepPartial<CometChatTheme["callLogsStyles"]>;
  /** Configuration for outgoing calls */
  outgoingCallConfiguration?: CometChatOutgoingCallInterface;
}

/**
 * CometChatCallLogs component.
 *
 * This component displays a list of call logs with support for custom item views,
 * pull-to-refresh, error and empty states, as well as outgoing call initiation.
 *
 * @param {CometChatCallLogsConfigurationInterface} props - Component configuration props.
 * @returns {JSX.Element} The rendered call logs component.
 */
export const CometChatCallLogs = (props: CometChatCallLogsConfigurationInterface): JSX.Element => {
  const {
    LeadingView,
    TitleView,
    SubtitleView,
    ItemView,
    TrailingView,
    AppBarOptions,
    callLogRequestBuilder,
    hideBackButton = true,
    EmptyView,
    ErrorView,
    LoadingView,
    hideError,
    onCallIconPress,
    onItemPress,
    onError,
    onBack,
    style,
    outgoingCallConfiguration,
    datePattern,
  } = props;

  const [list, setList] = useState<any[]>([]);
  const [listState, setListState] = useState<"loading" | "error" | "done">("loading");
  const [showOutgoingCallScreen, setShowOutgoingCallScreen] = useState(false);
  const themeV5 = useTheme();
  const mergedCallLogsStyle = useMemo(() => {
    return deepMerge(themeV5.callLogsStyles, style ?? {});
  }, [themeV5, style]);

  const loggedInUser = useRef<CometChat.User>();
  const callLogRequestBuilderRef = useRef<any>();
  const outGoingCall = useRef<CometChat.Call | CometChat.CustomMessage>();

  /**
   * Initializes the call log request builder.
   */
  function setRequestBuilder() {
    callLogRequestBuilderRef.current =
      (callLogRequestBuilder && callLogRequestBuilder.build()) ??
      new CometChatCalls.CallLogRequestBuilder()
        .setLimit(30)
        .setAuthToken(loggedInUser.current!.getAuthToken() || "")
        .setCallCategory("call")
        .build();
  }

  /**
   * Fetches the call logs using the configured request builder.
   */
  const fetchCallLogs = () => {
    setListState("loading");
    callLogRequestBuilderRef
      .current!.fetchNext()
      .then((callLogs: any) => {
        if (callLogs.length > 0) {
          setList([...list, ...callLogs]);
        }
        setListState("done");
      })
      .catch((err: CometChat.CometChatException) => {
        onError && onError(err);
        setListState("error");
      });
  };

  // Setup logged-in user and call listeners on mount.
  useEffect(() => {
    CometChat.getLoggedinUser()
      .then((u: CometChat.User | null) => {
        loggedInUser.current = u!;
        setRequestBuilder();
        fetchCallLogs();
      })
      .catch((e) => {
        onError && onError(e);
      });

    // Listener for outgoing call rejection
    CometChat.addCallListener(
      listenerId,
      new CometChat.CallListener({
        onOutgoingCallRejected: (call: CometChat.Call) => {
          setShowOutgoingCallScreen(false);
          outGoingCall.current = undefined;
        },
      })
    );

    // UI event listener for call rejection and call end
    CometChatUIEventHandler.addCallListener(listenerId, {
      ccCallRejected: (call: CometChat.Call) => {
        outGoingCall.current = undefined;
        setShowOutgoingCallScreen(false);
      },
      ccCallEnded: () => {
        outGoingCall.current = undefined;
        setShowOutgoingCallScreen(false);
      },
    });
  }, []);

  /**
   * Initiates a call based on the provided call log and type.
   *
   * @param {any} call - The call log item.
   * @param {any} type - The type of call (audio or video).
   */
  const makeCall = (call: any, type: any) => {
    if (type == CallTypeConstants.audio || type == CallTypeConstants.video) {
      // Determine the user or group to call based on the call log item.
      let user =
        call?.getReceiverType() == "user"
          ? loggedInUser.current?.getUid() === call?.getInitiator()?.getUid()
            ? call.getReceiver()
            : call?.getInitiator()
          : undefined;
      let group =
        call?.getReceiverType() == "group"
          ? loggedInUser.current?.getUid() === call?.getInitiator()?.getUid()
            ? call.getReceiver()
            : call?.getInitiator()
          : undefined;

      var receiverID = user ? user.getUid() : group ? group.getGuid() : undefined;
      var callType = type;
      var receiverType = user
        ? CometChat.RECEIVER_TYPE.USER
        : group
        ? CometChat.RECEIVER_TYPE.GROUP
        : undefined;
      if (!receiverID || !receiverType) return;

      var callObject = new CometChat.Call(
        receiverID,
        callType,
        receiverType,
        CometChat.CATEGORY_CALL
      );

      CometChat.initiateCall(callObject).then(
        (initiatedCall) => {
          outGoingCall.current = initiatedCall;
          setShowOutgoingCallScreen(true);
          CometChatUIEventHandler.emitCallEvent(CallUIEvents.ccOutgoingCall, {
            call: outGoingCall.current,
          });
        },
        (error) => {
          console.log("Call initialization failed with exception:", error);
          CometChatUIEventHandler.emitCallEvent(CallUIEvents.ccCallFailed, { call });
          onError && onError(error);
        }
      );
    } else {
      console.log(
        "Invalid call type.",
        type,
        CallTypeConstants.audio,
        type != CallTypeConstants.audio || type != CallTypeConstants.video
      );
      return;
    }
  };

  /**
   * Handles the press event on the call icon.
   *
   * @param {any} item - The call log item.
   */
  const onPress = (item: any) => {
    if (onCallIconPress) {
      onCallIconPress(item);
    } else {
      if (item?.getReceiverType() == "user") {
        makeCall(item, item.getType());
      }
    }
  };

  /**
   * Extracts and returns call details for display.
   *
   * @param {any} call - The call log item.
   * @returns {object} An object containing the title and avatar URL.
   */
  const getCallDetails = (call: any) => {
    const { mode, initiator, receiver, receiverType } = call;

    if (mode == "meet") {
      return {
        title: receiver["name"],
        avatarUrl: receiver["icon"],
      };
    } else if (mode == "call") {
      return {
        title:
          receiverType === "group"
            ? receiver["name"]
            : loggedInUser.current?.getUid() == initiator?.getUid()
            ? receiver["name"]
            : initiator["name"],
        avatarUrl:
          receiverType === "group"
            ? receiver["avatar"]
            : loggedInUser.current?.getUid() == initiator?.getUid()
            ? receiver["avatar"]
            : initiator["avatar"],
      };
    }
    return { title: "", avatarUrl: undefined };
  };

  /**
   * Renders each call log item.
   *
   * @param {object} param0 - Object containing the item and index.
   * @returns {JSX.Element} The rendered call log item.
   */
  const _render = ({ item, index }: any) => {
    if (ItemView) return ItemView(item);

    const { title, avatarUrl } = getCallDetails(item);
    const callStatus = CallUtils.getCallStatusForCallLogs(item, loggedInUser.current!);

    return (
      <TouchableOpacity onPress={() => onItemPress?.(item)}>
        <View style={mergedCallLogsStyle.itemStyle.containerStyle}>
          {LeadingView ? (
            LeadingView(item)
          ) : (
            <CometChatAvatar
              name={title}
              image={{ uri: avatarUrl }}
              style={{
                ...mergedCallLogsStyle.itemStyle.avatarStyle,
              }}
            />
          )}
          <View>
            {TitleView ? (
              TitleView(item)
            ) : (
              <Text
                style={[
                  mergedCallLogsStyle.itemStyle.titleTextStyle,
                  callStatus === "missed"
                    ? mergedCallLogsStyle.itemStyle.missedCallTitleTextStyle
                    : {},
                ]}
              >
                {title}
              </Text>
            )}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Icon
                name={
                  callStatus === "missed"
                    ? "call-missed-outgoing"
                    : callStatus === "incoming"
                    ? "call-received"
                    : "call-made"
                }
                size={16}
                color={
                  callStatus === "missed"
                    ? mergedCallLogsStyle.itemStyle.missedCallStatusIconStyle.tintColor
                    : callStatus === "incoming"
                    ? mergedCallLogsStyle.itemStyle.incomingCallStatusIconStyle.tintColor
                    : mergedCallLogsStyle.itemStyle.outgoingCallStatusIconStyle.tintColor
                }
                containerStyle={{ marginTop: 2 }}
              />
              {SubtitleView ? (
                SubtitleView(item)
              ) : (
                <Text style={mergedCallLogsStyle.itemStyle.subTitleTextStyle}>
                  {dateHelperInstance.getFormattedDate(
                    item["initiatedAt"] * 1000,
                    datePattern ?? DateHelper.patterns.callBubble
                  )}
                </Text>
              )}
            </View>
          </View>
          {TrailingView ? (
            TrailingView(item)
          ) : (
            <TouchableOpacity
              onPress={() => onPress(item)}
              style={{
                marginLeft: "auto",
              }}
            >
              <Icon
                name={item.type === "audio" ? "call" : "videocam"}
                size={24}
                color={mergedCallLogsStyle.itemStyle.callIconStyle.tintColor}
                imageStyle={mergedCallLogsStyle.itemStyle.callIconStyle}
              />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  /**
   * Renders the error view for the call logs.
   *
   * @returns {JSX.Element | null} The error state view.
   */
  const ErrorStateView = useCallback(() => {
    if (hideError) return null;
    if (ErrorView) return <ErrorView />;
    return (
      <ErrorEmptyView
        title='Oops!'
        subTitle='Looks like something went wrong.'
        tertiaryTitle='Please try again.'
        Icon={
          <Icon
            name='error-state'
            size={themeV5.spacing.margin.m15 << 1}
            containerStyle={{
              marginBottom: themeV5.spacing.margin.m5,
            }}
          />
        }
        containerStyle={Style.errorEmptyContainer}
        titleStyle={mergedCallLogsStyle.errorStateStyle?.titleStyle}
        subTitleStyle={mergedCallLogsStyle.errorStateStyle?.subTitleStyle}
        RetryView={
          <TouchableOpacity
            onPress={fetchCallLogs}
            style={{
              backgroundColor: themeV5.color.primary,
              paddingVertical: themeV5.spacing.spacing.s3,
              paddingHorizontal: themeV5.spacing.spacing.s10,
              borderRadius: themeV5.spacing.radius.r2,
              marginTop: themeV5.spacing.spacing.s5,
            }}
          >
            <Text
              style={{
                color: themeV5.color.primaryButtonIcon,
                ...themeV5.typography.button.medium,
              }}
            >
              {localize("RETRY")}
            </Text>
          </TouchableOpacity>
        }
      />
    );
  }, [themeV5]);

  /**
   * Renders the empty state view for call logs.
   *
   * @returns {JSX.Element} The empty state view.
   */
  const EmptyStateView = useCallback(() => {
    if (EmptyView) return <EmptyView />;
    return (
      <ErrorEmptyView
        title='No Call Logs Yet'
        subTitle='Make or receive calls to see your call history listed here'
        Icon={
          <Icon
            name='call-fill'
            size={themeV5.spacing.spacing.s15 << 1}
            color={themeV5.color.neutral300}
            containerStyle={{
              marginBottom: themeV5.spacing.spacing.s5,
            }}
          />
        }
        containerStyle={Style.errorEmptyContainer}
        titleStyle={mergedCallLogsStyle.emptyStateStyle?.titleStyle}
        subTitleStyle={mergedCallLogsStyle.emptyStateStyle?.subTitleStyle}
      />
    );
  }, [themeV5]);

  return (
    <View style={{ backgroundColor: themeV5.color.background1, height: "100%", width: "100%" }}>
      <>
        {/* Header with optional back button and app bar options */}
        <View
          style={[
            Style.row,
            Style.headerStyle,
            {
              padding: themeV5.spacing.spacing.s4,
              borderBottomWidth: 1,
              borderBottomColor: themeV5.color.borderLight,
              ...mergedCallLogsStyle.titleSeparatorStyle,
            },
          ]}
        >
          <View style={Style.row}>
            {!hideBackButton ? (
              <TouchableOpacity style={Style.imageStyle} onPress={onBack}>
                <Image
                  source={BackIcon}
                  style={[Style.imageStyle, { tintColor: themeV5.color.iconPrimary }]}
                />
              </TouchableOpacity>
            ) : null}
            <Text style={mergedCallLogsStyle.titleTextStyle}>{localize("CALLS")}</Text>
          </View>
          <View style={Style.row}>{AppBarOptions && <AppBarOptions />}</View>
        </View>
        {/* Render call logs based on state */}
        {listState == "loading" && list.length == 0 ? (
          LoadingView ? (
            <LoadingView />
          ) : (
            <Skeleton />
          )
        ) : listState == "error" && list.length == 0 ? (
          <ErrorStateView />
        ) : list.length == 0 ? (
          <EmptyStateView />
        ) : (
          <FlatList
            data={list}
            keyExtractor={(item, index) => item.sessionId + "_" + index}
            renderItem={_render}
            onEndReached={fetchCallLogs}
            refreshControl={
              <RefreshControl refreshing={listState === "loading"} onRefresh={fetchCallLogs} />
            }
          />
        )}
      </>
      {/* Outgoing call screen */}
      {showOutgoingCallScreen && (
        <CometChatOutgoingCall
          call={outGoingCall.current}
          onEndCallButtonPressed={(call) => {
            CometChat.rejectCall(call?.getSessionId(), CometChat.CALL_STATUS.CANCELLED).then(
              (rejectedCall) => {
                CometChatUIEventHandler.emitCallEvent(CallUIEvents.ccCallRejected, {
                  call: rejectedCall,
                });
              },
              (err) => {
                onError && onError(err);
              }
            );
          }}
          {...outgoingCallConfiguration}
        />
      )}
    </View>
  );
};
