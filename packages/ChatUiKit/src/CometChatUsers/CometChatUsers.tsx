import { CometChat } from "@cometchat/chat-sdk-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, ListRenderItem, Platform, View } from "react-native";
import {
  CometChatList,
  CometChatListActionsInterface,
  CometChatListProps,
  localize,
} from "../shared";
import { CometChatUIEventHandler } from "../shared/events/CometChatUIEventHandler/CometChatUIEventHandler";
import { deepMerge } from "../shared/helper/helperFunctions";
import { DeepPartial } from "../shared/helper/types";
import { Icon } from "../shared/icons/Icon";
import { CometChatStatusIndicatorInterface } from "../shared/views/CometChatStatusIndicator";
import { ErrorEmptyView } from "../shared/views/ErrorEmptyView/ErrorEmptyView";
import { useTheme } from "../theme";
import dark from "../theme/default/resources/icons/dark_error_icon.png";
import light from "../theme/default/resources/icons/light_error_icon.png";
import { useThemeInternal } from "../theme/hook";
import { Skeleton } from "./Skeleton";
import { UserStyle } from "./style";
import { CommonUtils } from "../shared/utils/CommonUtils";

/**
 * Interface for the props accepted by the CometChatUsers component.
 *
 * @interface CometChatUsersInterface
 * @extends {Omit<CometChatListProps, "title" | "requestBuilder" | "listStyle" | "SubtitleView" | "TailView" | "disableUsersPresence" | "ItemView" | "onItemPress" | "onItemLongPress" | "listItemKey" | "onSelection" | "statusIndicatorType" | "emptyStateText" | "errorStateText">}
 */
export interface CometChatUsersInterface
  extends Omit<
    CometChatListProps,
    | "title"
    | "requestBuilder"
    | "listStyle"
    | "SubtitleView"
    | "TailView"
    | "disableUsersPresence"
    | "ItemView"
    | "onItemPress"
    | "onItemLongPress"
    | "listItemKey"
    | "onSelection"
    | "statusIndicatorType"
    | "emptyStateText"
    | "errorStateText"
  > {
  /**
   * Callback function when a list item (user) is pressed.
   *
   * @param {CometChat.User} user - The user object that was pressed.
   */
  onItemPress?: (user: CometChat.User) => void;
  /**
   * Callback function when a list item (user) is long pressed.
   *
   * @param {CometChat.User} user - The user object that was long pressed.
   */
  onItemLongPress?: (user: CometChat.User) => void;
  /**
   * Callback function providing the selected users list.
   *
   * @param {CometChat.User[]} list - The array of selected user objects.
   */
  onSelection?: (list: CometChat.User[]) => void;
  /**
   * Users request builder instance to customize the user request.
   *
   * @type {CometChat.UsersRequestBuilder}
   */
  usersRequestBuilder?: CometChat.UsersRequestBuilder;
  /**
   * Custom styling for the users list.
   *
   * @type {DeepPartial<UserStyle>}
   */
  style?: DeepPartial<UserStyle>;
  /**
   * Custom title view component.
   *
   * @param {CometChat.User} conversation - The user conversation object.
   * @returns {JSX.Element}
   */
  TitleView?: (conversation: CometChat.User) => JSX.Element;
  /**
   * Function that returns a custom subtitle view for a user.
   *
   * @param {CometChat.User} item - The user object.
   * @returns {JSX.Element}
   */
  SubtitleView?: (item: CometChat.User) => JSX.Element;
  /**
   * Function that returns a custom trailing view for a user.
   *
   * @param {CometChat.User} item - The user object.
   * @returns {JSX.Element}
   */
  TrailingView?: (item: CometChat.User) => JSX.Element;
  /**
   * Function that returns a custom list item view.
   *
   * @param {CometChat.User} item - The user object.
   * @returns {JSX.Element}
   */
  ItemView?: (item: CometChat.User) => JSX.Element;
  /**
   * Custom component to display for the empty state.
   *
   * @returns {JSX.Element}
   */
  EmptyView?: () => JSX.Element;
  /**
   * Custom component to display for the error state.
   *
   * @returns {JSX.Element}
   */
  ErrorView?: () => JSX.Element;
  /**
   * Custom component to display for the loading state.
   *
   * @returns {JSX.Element}
   */
  LoadingView?: () => JSX.Element;
  /**
   * Custom leading view component.
   *
   * @param {CometChat.User} item - The user object.
   * @returns {JSX.Element}
   */
  LeadingView?: (item: CometChat.User) => JSX.Element;
  /**
   * Hide the header view.
   *
   * @type {boolean}
   */
  hideHeader?: boolean;
  /**
   * Placeholder text for the search input.
   *
   * @type {string}
   */
  searchPlaceholderText?: string;
}

/**
 * Interface for actions exposed by the CometChatUsers component.
 *
 * @interface CometChatUsersActionsInterface
 * @extends {CometChatListActionsInterface}
 */
export interface CometChatUsersActionsInterface extends CometChatListActionsInterface {}

/**
 * CometChatUsers component renders a list of users with support for search,
 * selection, and custom empty/error/loading states.
 *
 * @param {CometChatUsersInterface} props - Props passed to the component.
 * @param {React.Ref<CometChatUsersActionsInterface>} ref - Forwarded ref for component actions.
 * @returns {JSX.Element} The rendered users list.
 */
export const CometChatUsers = React.forwardRef<
  CometChatUsersActionsInterface,
  CometChatUsersInterface
>((props, ref) => {
  const userListenerId = "userStatus_" + new Date().getTime();
  const theme = useTheme();
  const { mode } = useThemeInternal();
  const [hideSearchError, setHideSearchError] = useState(false);

  const {
    usersRequestBuilder = new CometChat.UsersRequestBuilder()
      .setLimit(30)
      .hideBlockedUsers(false)
      .setRoles([])
      .friendsOnly(false)
      .setStatus("")
      .setTags([])
      .setUIDs([]),
    style = {},
    LoadingView,
    ErrorView,
    EmptyView,
    selectionMode,
    AppBarOptions,
    hideSearch = false,
    searchRequestBuilder,
    hideHeader,
    onSelection,
    searchPlaceholderText = localize("SEARCH"),
    ...newProps
  } = props;
  const userRef = useRef<CometChatUsersActionsInterface>(null);
  const mergedStyle = deepMerge(theme.userStyles, style);

  const [selectedUsers, setSelectedUsers] = useState<CometChat.User[]>([]);

  useEffect(() => {
    // Listen for changes in user online/offline status.
    CometChat.addUserListener(
      userListenerId,
      new CometChat.UserListener({
        /**
         * Callback when a user comes online.
         *
         * @param {CometChat.User} onlineUser - The user who is online.
         */
        onUserOnline: (onlineUser: CometChat.User) => {
          if (!onlineUser.getBlockedByMe()) {
            userRef.current!.updateList(onlineUser);
          }
        },
        /**
         * Callback when a user goes offline.
         *
         * @param {CometChat.User} offlineUser - The user who is offline.
         */
        onUserOffline: (offlineUser: CometChat.User) => {
          if (!offlineUser.getBlockedByMe()) {
            userRef.current!.updateList(offlineUser);
          }
        },
      })
    );
    return () => CometChat.removeUserListener(userListenerId);
  }, []);

  /**
   * Handler for when a user is blocked.
   *
   * @param {{ user: CometChat.User }} param0 - The user object that is blocked.
   */
  const handleccUserBlocked = ({ user }: any) => {
    const clonedUser = CommonUtils.clone(user);
    clonedUser.blockedByMe = true;
    clonedUser.hasBlockedMe = true;
    userRef.current!.updateList(clonedUser);
  };

  /**
   * Handler for when a user is unblocked.
   *
   * @param {{ user: CometChat.User }} param0 - The user object that is unblocked.
   */
  const handleccUserUnBlocked = ({ user }: any) => {
    const clonedUser = CommonUtils.clone(user);
    clonedUser.blockedByMe = false;
    clonedUser.hasBlockedMe = false;
    userRef.current!.updateList(clonedUser);

    CometChat.getUser(clonedUser.getUid()).then((updatedUser) => {
      userRef.current!.updateList(updatedUser);
    });
  };

  useEffect(() => {
    CometChatUIEventHandler.addUserListener(userListenerId, {
      ccUserBlocked: (item: any) => handleccUserBlocked(item),
      ccUserUnBlocked: (item: any) => handleccUserUnBlocked(item),
    });
    return () => {
      CometChatUIEventHandler.removeUserListener(userListenerId);
    };
  }, []);

  /**
   * Renders the empty state view when there are no users.
   *
   * @returns {JSX.Element} The empty state view.
   */
  const EmptyStateView = useCallback(() => {
    return (
      <KeyboardAvoidingView
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        behavior={Platform.select({ ios: "padding", android: "height" })}
        style={{ flex: 1 }}
      >
        <ErrorEmptyView
          title={localize("NO_USERS_AVAILABLE")}
          subTitle={localize("ADD_CONTACTS")}
          Icon={
            <Icon
              name='user-empty-icon'
              icon={mergedStyle.emptyStateStyle.icon}
              color={theme.color.neutral300}
              size={theme.spacing.spacing.s15 << 1}
              containerStyle={{
                marginBottom: theme.spacing.spacing.s5,
              }}
            />
          }
          containerStyle={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: "10%",
          }}
          titleStyle={mergedStyle.emptyStateStyle.titleStyle}
          subTitleStyle={mergedStyle.emptyStateStyle.subTitleStyle}
        />
      </KeyboardAvoidingView>
    );
  }, [theme, mergedStyle]);

  /**
   * Renders the error state view when there is an error fetching users.
   *
   * @returns {JSX.Element} The error state view.
   */
  const ErrorStateView = useCallback(() => {
    useEffect(() => {
      // Hide search when error view is active.
      setHideSearchError(true);
    }, []);
    return (
      <View style={{ flex: 1 }}>
        <ErrorEmptyView
          title={localize("OOPS")}
          subTitle={localize("SOMETHING_WENT_WRONG")}
          Icon={
            <Icon
              icon={mergedStyle.errorStateStyle.icon || mode === "dark" ? dark : light}
              imageStyle={{
                height: 120,
                width: 120,
              }}
              containerStyle={{
                marginBottom: theme.spacing.margin.m5,
              }}
            />
          }
          containerStyle={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: "10%",
          }}
          titleStyle={mergedStyle.errorStateStyle.titleStyle}
          subTitleStyle={mergedStyle.errorStateStyle.subTitleStyle}
        />
      </View>
    );
  }, [theme, mergedStyle]);

  return (
    <View style={theme.userStyles.containerStyle}>
      <CometChatList
        hideHeader={hideHeader ?? hideHeader}
        searchPlaceholderText={searchPlaceholderText}
        searchRequestBuilder={searchRequestBuilder}
        hideBackButton={props.hideBackButton}
        hideSubmitButton={props.hideSubmitButton}
        AppBarOptions={AppBarOptions}
        title={localize("USERS")}
        selectionMode={selectionMode}
        onSelection={(updatedSelection) => {
          setSelectedUsers(updatedSelection);
          props.onSelection && props.onSelection(updatedSelection);
        }}
        ItemView={props.ItemView}
        ref={userRef}
        hideSearch={hideSearch ? hideSearch : hideSearchError}
        requestBuilder={usersRequestBuilder}
        listStyle={mergedStyle}
        listItemKey='uid'
        LoadingView={LoadingView ?? (() => <Skeleton />)}
        EmptyView={EmptyView ? EmptyView : () => <EmptyStateView />}
        ErrorView={ErrorView ? ErrorView : () => <ErrorStateView />}
        statusIndicatorType={(user: CometChat.User) => {
          if (user?.getBlockedByMe()) {
            return "offline";
          }
          return user?.getStatus() as CometChatStatusIndicatorInterface["type"];
        }}
        {...newProps}
      />
    </View>
  );
});
