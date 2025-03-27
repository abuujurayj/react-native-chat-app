import { CometChat } from "@cometchat/chat-sdk-react-native";
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { localize } from "../../resources";
import { CommonUtils } from "../../utils/CommonUtils";
import { CometChatListItem } from "../CometChatListItem";
import { useTheme } from "../../../theme";
import { Skeleton } from "../../../CometChatConversations";
import { ErrorEmptyView } from "../ErrorEmptyView/ErrorEmptyView";
import { Icon } from "../../icons/Icon";

export interface CometChatReactionListInterface {
  message: CometChat.BaseMessage;
  onPress?: (messageReaction: CometChat.Reaction, message: CometChat.BaseMessage) => void;
  reactionsRequestBuilder?: CometChat.ReactionsRequestBuilder;
  selectedReaction?: string;
  ErrorStateView?: () => JSX.Element;
  errorStateText?: string;
  LoadingStateView?: () => JSX.Element;
}

export const CometChatReactionList = (props: CometChatReactionListInterface) => {
  const {
    message,
    onPress,
    reactionsRequestBuilder,
    selectedReaction,
    ErrorStateView,
    errorStateText,
    LoadingStateView,
  } = props;
  const theme = useTheme();
  const reactionListStyleFromTheme = theme.reactionListStyles.reactionListItemStyle;
  const tabStyleFromTheme = theme.reactionListStyles.tabStyle;

  const [messageReactions, setMessageReactions] = useState(message?.getReactions() || []);
  const [currentSelectedReaction, setCurrentSelectedReaction] = useState(selectedReaction || "All");
  const [reactionList, setReactionList] = useState<CometChat.Reaction[]>();
  const [state, setState] = useState<"loading" | "error" | "done" | "fetchNextOnScroll">("loading");
  const loggedInUser = useRef<CometChat.User | null>();
  const newMessageObj = useRef<CometChat.BaseMessage>(CommonUtils.clone(message));

  const requestBuilderMap = useRef<Record<string, CometChat.ReactionsRequest>>({});
  const reactionListMap = useRef<Record<string, CometChat.Reaction[]>>({});
  const listRef = useRef<FlatList | null>(null);

  useEffect(() => {
    CometChat.getLoggedinUser()
      .then((user) => (loggedInUser.current = user))
      .catch((rej) => {
        loggedInUser.current = null;
        // onError && onError(rej);
      });
    showReactions(true);
    let newMessageReactions = message?.getReactions() || [];
    _setAllReactions(newMessageReactions);
  }, []);

  useEffect(() => {
    showReactions();
  }, [currentSelectedReaction]);

  const _setAllReactions = (_messageReactions: any) => {
    let totalCount = _messageReactions.reduce((acc: any, curr: any) => acc + curr.count, 0);
    const allReactionCountObject = new CometChat.ReactionCount("All", totalCount, false);
    setMessageReactions([allReactionCountObject, ..._messageReactions]);
  };

  const showReactions = async (firstFetch?: boolean) => {
    const requestBuilder = getRequestBuilder(currentSelectedReaction);
    const list = await getReactionList(requestBuilder, currentSelectedReaction);
    if (firstFetch && currentSelectedReaction !== "All") {
      await getReactionList(getRequestBuilder("All"), "All");
    }
    setReactionList(list);
  };

  const getRequestBuilder = (reaction: string): CometChat.ReactionsRequest => {
    let requestBuilder: CometChat.ReactionsRequestBuilder;
    if (requestBuilderMap.current[reaction]) {
      return requestBuilderMap.current[reaction];
    }

    requestBuilder = reactionsRequestBuilder || new CometChat.ReactionsRequestBuilder();
    requestBuilder.setLimit(10).setMessageId(message?.getId());

    if (reaction !== "All") {
      requestBuilder.setReaction(reaction);
    }

    const request = requestBuilder.build();
    requestBuilderMap.current[reaction] = request;
    return request;
  };

  const getReactionList = async (requestBuilder: CometChat.ReactionsRequest, reaction: string) => {
    setState("loading");

    if (reactionListMap.current[reaction]) {
      setState("done");
      let list = reactionListMap.current[reaction];
      return list;
    }

    try {
      const list = await requestBuilder.fetchNext();
      reactionListMap.current[reaction] = list;
      setState("done");
      return list;
    } catch (error: any) {
      console.log("error while fetching reactions", error);
      if (error?.code === "REQUEST_IN_PROGRESS") return;
      setState("error");
      return [];
    }
  };

  const fetchNext = async () => {
    try {
      const requestBuilder = getRequestBuilder(currentSelectedReaction);
      if (reactionListMap.current[currentSelectedReaction]?.length === 0) {
        return;
      } else {
        const newList = await requestBuilder.fetchNext();
        reactionListMap.current[currentSelectedReaction] = [
          ...(reactionListMap.current?.[currentSelectedReaction] || []),
          ...newList,
        ];
        setReactionList(reactionListMap.current[currentSelectedReaction]);
      }
      setState("done");
    } catch (error: any) {
      console.log("error while fetching next reactions", error);
      if (error?.code === "REQUEST_IN_PROGRESS") return;
      setState("error");
    }
  };

  const removeReaction = (reactionObj: CometChat.Reaction) => {
    let reactedByMe = loggedInUser.current!.getUid() === reactionObj?.getReactedBy()?.getUid();
    if (reactedByMe) {
      if (onPress) {
        onPress(reactionObj, newMessageObj.current);
        return;
      }

      let newReactionList = reactionList
        ? [...reactionList]?.filter(
            (reaction: CometChat.Reaction) =>
              reaction?.getReactionId() !== reactionObj?.getReactionId()
          )
        : [];
      setReactionList(newReactionList);

      if (currentSelectedReaction === "All") {
        reactionListMap.current[currentSelectedReaction] = [...newReactionList];
        reactionListMap.current[reactionObj?.getReaction()] = reactionListMap.current[
          reactionObj?.getReaction()
        ]?.filter(
          (reaction: CometChat.Reaction) =>
            reaction?.getReactionId() !== reactionObj?.getReactionId()
        );
      } else {
        reactionListMap.current[currentSelectedReaction] = [...newReactionList];
        reactionListMap.current["All"] = reactionListMap.current["All"]?.filter(
          (reaction: CometChat.Reaction) =>
            reaction?.getReactionId() !== reactionObj?.getReactionId()
        );
      }

      let newMessageReactions = [...messageReactions];

      let messageReactionIndex = newMessageReactions.findIndex(
        (reaction) => reaction?.getReaction() === reactionObj?.getReaction()
      );
      if (messageReactionIndex > -1) {
        if (newMessageReactions[messageReactionIndex]?.getCount() > 1) {
          newMessageReactions[messageReactionIndex].setCount(
            newMessageReactions[messageReactionIndex].getCount() - 1
          );
          newMessageReactions[messageReactionIndex].setReactedByMe(false);
          newMessageReactions.shift();
          _setAllReactions(newMessageReactions);
        } else {
          newMessageReactions.splice(messageReactionIndex, 1);
          newMessageReactions.shift();
          _setAllReactions(newMessageReactions);
          setCurrentSelectedReaction("All");
        }
      }

      newMessageObj.current.setReactions(newMessageReactions);
    }
  };

  const subtitleView = useCallback((item: any) => {
    let reactedByMe = loggedInUser.current!.getUid() === item?.reactedBy?.uid;
    return reactedByMe ? (
      <Text style={reactionListStyleFromTheme.subtitleStyle}>{localize("TAP_TO_REMOVE")}</Text>
    ) : null;
  }, []);

  const _render = ({ item, index }: { item: any; index: number }) => {
    function getName() {
      let reactedByMe = loggedInUser.current!.getUid() === item?.reactedBy?.uid;
      return reactedByMe ? localize("YOU") : item?.reactedBy?.name;
    }

    return (
      <>
        <CometChatListItem
          id={item?.id || index}
          title={getName()}
          titleStyle={reactionListStyleFromTheme.titleStyle}
          avatarStyle={reactionListStyleFromTheme.avatarStyle}
          containerStyle={reactionListStyleFromTheme.containerStyle}
          avatarName={item?.reactedBy?.name}
          avatarURL={item?.reactedBy?.avatar ? { uri: item?.reactedBy?.avatar } : undefined}
          SubtitleView={subtitleView(item)}
          TrailingView={
            <Text
              style={[
                reactionListStyleFromTheme.emojiStyle,
                //toDoM: emojis look washed out on Android without a color
                Platform.OS === "android" ? { color: theme.color.primary } : {},
              ]}
            >
              {item?.reaction}
            </Text>
          }
          onPress={(id: any) => removeReaction(item)}
          titleSubtitleContainerStyle={reactionListStyleFromTheme.titleContainerStyle}
        />
      </>
    );
  };

  const ErrorView = () => {
    if (ErrorStateView) return <ErrorStateView />;
    return (
      <ErrorEmptyView
        title={errorStateText ?? "Oops!"}
        subTitle='Looks like something went wrong.'
        tertiaryTitle='Please try again.'
        Icon={
          <Icon
            name='error-state'
            size={theme.spacing.spacing.s15 * 2}
            icon={theme.reactionListStyles.errorStateStyle?.icon}
            height={theme.reactionListStyles.errorStateStyle?.iconStyle?.height}
            width={theme.reactionListStyles.errorStateStyle?.iconStyle?.width}
            imageStyle={theme.reactionListStyles.errorStateStyle?.iconStyle}
            containerStyle={theme.reactionListStyles.errorStateStyle?.iconContainerStyle}
          />
        }
        containerStyle={theme.reactionListStyles.errorStateStyle?.containerStyle}
        titleStyle={theme.reactionListStyles.errorStateStyle?.titleStyle}
        subTitleStyle={theme.reactionListStyles.errorStateStyle?.subtitleStyle}
      />
    );
  };

  const LoadingView = () => {
    if (LoadingStateView) return <LoadingStateView />;
    return (
      <View
        style={{
          flex: 1,
        }}
      >
        <Skeleton />
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Slider for reactions */}
      {state != "error" && (
        <View>
          <ScrollView
            showsHorizontalScrollIndicator={false}
            horizontal={true}
            style={tabStyleFromTheme.containerStyle}
          >
            {messageReactions?.length > 0 &&
              messageReactions.map((reactionObject, index) => {
                return (
                  <TouchableOpacity
                    style={
                      currentSelectedReaction === reactionObject?.getReaction()
                        ? tabStyleFromTheme.selectedItemStyle
                        : tabStyleFromTheme.itemStyle
                    }
                    key={index}
                    onPress={() => setCurrentSelectedReaction(reactionObject?.getReaction())}
                  >
                    <Text
                      style={
                        currentSelectedReaction === reactionObject?.getReaction()
                          ? reactionObject?.getReaction() === "All"
                            ? tabStyleFromTheme.selectedItemTextStyle
                            : tabStyleFromTheme.selectedItemEmojiStyle
                          : reactionObject?.getReaction() === "All"
                          ? tabStyleFromTheme.itemTextStyle
                          : tabStyleFromTheme.itemEmojiStyle
                      }
                    >
                      {reactionObject?.getReaction() === "All"
                        ? localize("ALL")
                        : reactionObject?.getReaction()}
                    </Text>
                    <Text
                      style={
                        currentSelectedReaction === reactionObject?.getReaction()
                          ? tabStyleFromTheme.selectedItemTextStyle
                          : tabStyleFromTheme.itemTextStyle
                      }
                    >
                      {reactionObject?.getCount()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
          </ScrollView>

          <View
            style={{
              height: 1,
              backgroundColor: theme.color.borderLight,
            }}
          />
        </View>
      )}

      {state === "error" ? (
        <ErrorView />
      ) : state === "loading" ? (
        <LoadingView />
      ) : (
        <View style={{ flex: 1, marginBottom: 20 }}>
          <FlatList
            data={reactionList}
            ref={listRef}
            keyExtractor={(item, index) => index.toString()}
            style={{
              flex: 1,
            }}
            contentContainerStyle={{
              paddingHorizontal: 5,
            }}
            renderItem={_render}
            onMomentumScrollEnd={(event) => {
              const contentOffsetY = event.nativeEvent.contentOffset.y; // The current scroll position
              const contentHeight = event.nativeEvent.contentSize.height; // Total height of the content
              const layoutHeight = event.nativeEvent.layoutMeasurement.height; // Height of the visible area

              if (contentOffsetY + layoutHeight >= contentHeight - 10) {
                setState("fetchNextOnScroll");
                fetchNext();
              }
            }}
          />
          {state == "fetchNextOnScroll" && (
            <ActivityIndicator
              color={theme.color.primary}
              size={"large"}
              style={{
                position: "absolute",
                flex: 1,
                alignSelf: "center",
                paddingHorizontal: 5,
                bottom: "50%",
              }}
            />
          )}
        </View>
      )}
    </View>
  );
};
