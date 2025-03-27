import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ColorValue,
  ImageSourcePropType,
  Modal,
  Platform,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import {
  CometChatBottomSheet,
  CometChatGroupsEvents,
  CometChatUIEventHandler,
  CometChatUIKit,
} from "../shared";
import { CometChat } from "@cometchat/chat-sdk-react-native";
import { CometChatList, CometChatListProps, localize } from "../shared";
import { MessageTypeConstants } from "../shared/constants/UIKitConstants";
import { deepMerge } from "../shared/helper/helperFunctions";
import { DeepPartial } from "../shared/helper/types";
import { Icon, IconName } from "../shared/icons/Icon";
import {
  getUnixTimestamp,
  getUnixTimestampInMilliseconds,
} from "../shared/utils/CometChatMessageHelper";
import { CometChatStatusIndicatorInterface } from "../shared/views/CometChatStatusIndicator";
import { TooltipMenu } from "../shared/views/CometChatTooltipMenu";
import { ErrorEmptyView } from "../shared/views/ErrorEmptyView/ErrorEmptyView";
import { useTheme } from "../theme";
import { useThemeInternal } from "../theme/hook";
import { Skeleton } from "./Skeleton";
import { GroupMemberStyle } from "./style";

/**
 * Props for the CometChatGroupMembers component.
 */
export interface CometChatGroupMembersInterface
  extends Omit<
    CometChatListProps,
    | "requestBuilder"
    | "listItemKey"
    | "statusIndicatorStyle"
    | "avatarStyle"
    | "listItemStyle"
    | "ListItemView"
    | "searchRequestBuilder"
    | "onSelection"
    | "disableUsersPresence"
    | "errorStateText"
    | "emptyStateText"
  > {
  /**
   * Custom view for subtitle.
   * @param item - Object of CometChat.GroupMember.
   * @returns JSX.Element.
   */
  SubtitleView?: (item: CometChat.GroupMember) => JSX.Element;
  /**
   * Custom tail view.
   * @param item - Object of CometChat.GroupMember.
   * @returns JSX.Element.
   */
  TrailingView?: (item: CometChat.GroupMember) => JSX.Element;
  /**
   * Custom view for empty state.
   * @returns JSX.Element.
   */
  EmptyView?: () => JSX.Element;
  /**
   * Custom view for error state.
   * @returns JSX.Element.
   */
  ErrorView?: () => JSX.Element;
  /**
   * Custom view for loading state.
   * @returns JSX.Element.
   */
  LoadingView?: () => JSX.Element;
  /**
   * Callback for press on ListItem.
   * @param groupMember - Object of CometChat.GroupMember.
   * @returns void.
   */
  onItemPress?: (groupMember: CometChat.GroupMember) => void;
  /**
   * Callback for long press on ListItem.
   * @param groupMember - Object of CometChat.GroupMember.
   * @returns void.
   */
  onItemLongPress?: (groupMember: CometChat.GroupMember) => void;
  /**
   * Callback for on selection of group members.
   * @param list - Array of selected GroupMembers.
   * @returns void.
   */
  onSelection?: (list: CometChat.GroupMember[]) => void;
  /**
   * Pass search request builder object.
   */
  searchRequestBuilder?: CometChat.GroupMembersRequestBuilder;
  /**
   * Pass group member request builder object.
   */
  groupMemberRequestBuilder?: CometChat.GroupMembersRequestBuilder;
  /**
   * Pass CometChat SDK's group object.
   */
  group: CometChat.Group;
  /**
   * Style for group member.
   */
  style?: DeepPartial<GroupMemberStyle>;
  /**
   * Custom Item view.
   */
  ItemView?: (item: CometChat.GroupMember) => JSX.Element;
  /**
   * Custom ListItem view.
   */
  LeadingView?: (item: CometChat.GroupMember) => JSX.Element;
}

/**
 * Component to render and manage the list of group members.
 *
 * This component renders a list of group members using CometChatList and provides functionality
 * to manage member roles (change scope), ban, or remove members through menus and modals.
 *
 * @param props - Props of type CometChatGroupMembersInterface.
 * @returns JSX.Element.
 */
export const CometChatGroupMembers = (props: CometChatGroupMembersInterface) => {
  const {
    SubtitleView,
    ItemView,
    AppBarOptions,
    searchPlaceholderText = "Search",
    hideBackButton = false,
    onSelection,
    hideSearch,
    EmptyView,
    ErrorView,
    LoadingView,
    groupMemberRequestBuilder,
    searchRequestBuilder,
    group,
    hideError,
    onBack,
    selectionMode = "none",
    style = {},
    TrailingView,
    LeadingView,
    ...newProps
  } = props;

  // Get theme information and merge with provided style overrides.
  const theme = useTheme();
  const mergedStyle = deepMerge(theme.groupMemberStyle, style);
  const { mode } = useThemeInternal();

  // State management for UI elements
  const [hideSearchError, setHideSearchError] = useState(false);
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CometChat.GroupMember | null>(null);
  const tooltipPositon = React.useRef({ pageX: 0, pageY: 0 });
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [modalType, setModalType] = useState<"ban" | "kick" | "">("");
  const modalVisible = modalType !== "";
  const [selectedRole, setSelectedRole] = useState("Participant");
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const listRef = useRef<any>(null);
  const [isToolTipDismissed, setIsToolTipDismissed] = useState(false);
  const loggedInUser = React.useRef(CometChatUIKit.loggedInUser!);

  // Define role permissions for current user actions
  const RolePermissions: { [key: string]: string[] } = {
    OWNER: ["Change Scope", "Ban", "Remove"],
    ADMIN: ["Change Scope", "Ban", "Remove"],
    MODERATOR: ["Change Scope", "Ban", "Remove"],
    PARTICIPANT: [],
  };

  // Determine available roles based on current user's role
  const roles = React.useMemo(() => {
    if (currentUserRole === "moderator") {
      return ["Moderator", "Participant"];
    }
    return ["Admin", "Moderator", "Participant"];
  }, [currentUserRole]);

  // Set current user role based on whether the logged in user is the owner or not.
  useEffect(() => {
    if (CometChatUIKit.loggedInUser!.getUid() === group.getOwner()) {
      setCurrentUserRole("owner");
    } else {
      setCurrentUserRole(group.getScope());
    }
  }, [group]);

  /**
   * Renders an empty state view when no users are available.
   */
  const EmptyStateView = useCallback(() => {
    return (
      <View style={{ flex: 1 }}>
        <ErrorEmptyView
          title={localize("NO_USERS_AVAILABLE")}
          subTitle={localize("ADD_CONTACTS")}
          Icon={
            <Icon
              name='user-empty-icon'
              icon={mergedStyle?.emptyStateStyle?.icon as ImageSourcePropType | JSX.Element}
              color={mergedStyle?.emptyStateStyle?.iconStyle?.tintColor}
              height={mergedStyle?.emptyStateStyle?.iconStyle?.height}
              width={mergedStyle?.emptyStateStyle?.iconStyle?.width}
              containerStyle={mergedStyle?.emptyStateStyle?.iconContainerStyle}
            />
          }
          containerStyle={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: "10%",
          }}
          titleStyle={mergedStyle?.emptyStateStyle?.titleStyle as TextStyle}
          subTitleStyle={mergedStyle?.emptyStateStyle?.subTitleStyle as TextStyle}
        />
      </View>
    );
  }, [theme]);

  /**
   * Renders an error state view when something goes wrong.
   * Also hides the search bar when the error view is active.
   */
  const ErrorStateView = useCallback(() => {
    useEffect(() => {
      setHideSearchError(true); // Hide search when error view is active
    }, []);
    return (
      <View style={{ flex: 1 }}>
        <ErrorEmptyView
          title={localize("OOPS")}
          subTitle={localize("SOMETHING_WENT_WRONG")}
          Icon={
            <Icon
              icon={mergedStyle?.errorStateStyle?.icon as ImageSourcePropType | JSX.Element}
              color={mergedStyle?.errorStateStyle?.iconStyle?.tintColor}
              height={mergedStyle?.errorStateStyle?.iconStyle?.height}
              width={mergedStyle?.errorStateStyle?.iconStyle?.width}
              containerStyle={mergedStyle?.errorStateStyle?.iconContainerStyle}
            />
          }
          containerStyle={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: "10%",
          }}
          titleStyle={mergedStyle?.errorStateStyle?.titleStyle as TextStyle}
          subTitleStyle={mergedStyle?.errorStateStyle?.subTitleStyle as TextStyle}
        />
      </View>
    );
  }, [theme]);

  /**
   * Returns the appropriate badge view based on the user's role.
   * @param user - A group member whose badge is to be rendered.
   * @returns JSX.Element for the badge.
   */
  const TailViewContent = (user: CometChat.GroupMember): JSX.Element => {
    const userRole = user?.getScope();
    if (userRole === "participant") {
      return <></>;
    }
    if (user.getUid() === group.getOwner()) {
      return (
        <View style={{ ...mergedStyle.ownerBadgeStyle?.containerStyle }}>
          <Text style={{ ...mergedStyle.ownerBadgeStyle?.textStyle }}>{localize("OWNER")}</Text>
        </View>
      );
    }
    if (userRole === "moderator") {
      return (
        <View style={{ ...mergedStyle.moderatorBadgeStyle?.containerStyle }}>
          <Text style={{ ...mergedStyle.moderatorBadgeStyle?.textStyle }}>
            {localize("MODERATOR")}
          </Text>
        </View>
      );
    }
    if (userRole === "admin") {
      return (
        <View style={{ ...mergedStyle.adminBadgeStyle?.containerStyle }}>
          <Text style={{ ...mergedStyle.adminBadgeStyle?.textStyle }}>{localize("ADMIN")}</Text>
        </View>
      );
    }
    return <></>;
  };

  /**
   * Removes (kicks) a user from the group.
   *
   * @param groupId - The unique identifier for the group.
   * @param user - The group member to remove.
   */
  const removeGroupMember = async (groupId: string, user: CometChat.GroupMember) => {
    try {
      const removedMember = await CometChat.kickGroupMember(groupId, user.getUid());
      console.log("Group member removed successfully:", removedMember);

      // Remove the user from the list view.
      listRef.current && listRef.current.removeItemFromList(user.getUid());

      // Update group's member count if possible.
      if (group.setMembersCount && typeof group.setMembersCount === "function") {
        group.setMembersCount(group.getMembersCount() - 1);
      }

      // Clear the modal and selected item state.
      setModalType("");
      setSelectedItem(null);

      // Create an action object to notify about the removal.
      let action: CometChat.Action = new CometChat.Action(
        group.getGuid(),
        MessageTypeConstants.groupMember,
        CometChat.RECEIVER_TYPE.GROUP,
        CometChat.CATEGORY_ACTION as CometChat.MessageCategory
      );

      action.setActionBy(loggedInUser.current);
      action.setActionOn(user);
      action.setActionFor(group);
      action.setMessage(`${loggedInUser.current.getName()} kicked ${user.getName()}`);
      action.setSentAt(getUnixTimestamp());
      action.setMuid(String(getUnixTimestampInMilliseconds()));
      action.setSender(loggedInUser.current);
      action.setReceiver(group);
      action.setConversationId("group_" + group.getGuid());

      // Emit the group event for a kicked member.
      CometChatUIEventHandler.emitGroupEvent(CometChatGroupsEvents.ccGroupMemberKicked, {
        message: action,
        kickedUser: user,
        kickedBy: loggedInUser.current,
        kickedFrom: group,
      });
    } catch (error) {
      console.error("Error removing user:", error);
    }
  };

  /**
   * Bans a user from the group.
   *
   * @param user - The group member to ban.
   */
  const banGroupMember = async (user: CometChat.GroupMember) => {
    try {
      await CometChat.banGroupMember(group.getGuid(), user.getUid());

      // Remove the user from the list view.
      listRef.current && listRef.current.removeItemFromList(user.getUid());

      // Clear the modal and selected item state.
      setModalType("");
      setSelectedItem(null);

      // Create an action object to notify about the ban.
      let action: CometChat.Action = new CometChat.Action(
        group.getGuid(),
        MessageTypeConstants.groupMember,
        CometChat.RECEIVER_TYPE.GROUP,
        CometChat.CATEGORY_ACTION as CometChat.MessageCategory
      );
      action.setActionBy(loggedInUser.current);
      action.setActionOn(user);
      action.setActionFor(group);
      action.setMessage(`${loggedInUser.current.getName()} banned ${user.getName()}`);
      action.setSentAt(getUnixTimestamp());
      action.setMuid(String(getUnixTimestampInMilliseconds()));
      action.setSender(loggedInUser.current);
      action.setReceiver(group);
      group.setMembersCount(group.getMembersCount() - 1);

      // Emit the group event for a banned member.
      CometChatUIEventHandler.emitGroupEvent(CometChatGroupsEvents.ccGroupMemberBanned, {
        message: action,
        kickedUser: user,
        kickedBy: loggedInUser.current,
        kickedFrom: group,
      });
    } catch (error) {
      console.error("Error banning user:", error);
    }
  };

  return (
    <View style={mergedStyle.containerStyle as ViewStyle}>
      <CometChatList
        ref={listRef}
        selectionMode={selectionMode}
        // Long press to open tooltip menu for management actions.
        onItemLongPress={(item, e) => {
          const targetIsOwner = item.uid === group.getOwner();
          const targetScope = item.scope;

          // Role based restrictions for long press actions.
          if (currentUserRole === "owner") {
            // Owner can perform any action.
          } else if (currentUserRole === "admin") {
            // Admin cannot manage owner or other admins.
            if (targetIsOwner || targetScope === "admin") {
              return;
            }
          } else if (currentUserRole === "moderator") {
            // Moderator cannot manage owner, admin or other moderators.
            if (targetIsOwner || targetScope === "admin" || targetScope === "moderator") {
              return;
            }
          } else if (currentUserRole === "participant") {
            // Participant does not have any management menu.
            return;
          }

          // Set tooltip position based on the long press event coordinates.
          if (["owner", "admin", "moderator"].includes(currentUserRole!)) {
            if (e && e.nativeEvent) {
              tooltipPositon.current = {
                pageX: e.nativeEvent.pageX,
                pageY: e.nativeEvent.pageY,
              };
            } else {
              tooltipPositon.current = { pageX: 200, pageY: 100 };
            }
            setSelectedItem(item);

            // Prevent users from opening the menu for themselves.
            if (item.uid !== CometChatUIKit.loggedInUser!.getUid()) {
              setTooltipVisible(true);
              setIsToolTipDismissed(false);
            }
          }
        }}
        listItemKey={"uid"}
        AppBarOptions={AppBarOptions}
        hideStickyHeader={true}
        onSelection={onSelection}
        hideBackButton={hideBackButton}
        SubtitleView={SubtitleView ?? SubtitleView}
        searchPlaceholderText={searchPlaceholderText}
        TrailingView={TrailingView ?? TailViewContent}
        hideSearch={hideSearch ? hideSearch : hideSearchError}
        title={localize("MEMBERS")}
        searchRequestBuilder={searchRequestBuilder}
        // Create a new group member request if one is not provided.
        requestBuilder={
          groupMemberRequestBuilder ||
          new CometChat.GroupMembersRequestBuilder(group["guid"]).setLimit(30)
        }
        hideError={hideError}
        onBack={onBack}
        ItemView={ItemView}
        listStyle={mergedStyle}
        LoadingView={LoadingView ? LoadingView : () => <Skeleton />}
        EmptyView={EmptyView ? EmptyView : () => <EmptyStateView />}
        ErrorView={ErrorView ? ErrorView : () => <ErrorStateView />}
        statusIndicatorType={(user: CometChat.User) =>
          user?.getStatus() as CometChatStatusIndicatorInterface["type"]
        }
        LeadingView={LeadingView}
        {...newProps}
      />

      {/* Render tooltip menu if an item is selected and selectionMode is disabled */}
      {selectedItem && selectionMode === "none" && (
        <View
          style={{
            position: "absolute",
            top: tooltipPositon.current.pageY,
            left: tooltipPositon.current.pageX,
            zIndex: 9999,
          }}
        >
          <TooltipMenu
            visible={tooltipVisible}
            onClose={() => {
              setTooltipVisible(false);
              Platform.OS === "android" && setIsToolTipDismissed(true);
            }}
            onDismiss={() => {
              setIsToolTipDismissed(true);
            }}
            event={{
              nativeEvent: tooltipPositon.current,
            }}
            // Define menu items with actions based on current user's permissions.
            menuItems={[
              {
                text: "Change Scope",
                onPress: () => {
                  const currentScope = selectedItem.getScope();
                  setTooltipVisible(false);
                  const formattedScope =
                    currentScope.charAt(0).toUpperCase() + currentScope.slice(1);
                  setIsBottomSheetVisible(true);
                  setSelectedRole(formattedScope);
                },
                iconName: "change-circle" as IconName,
                textColor: theme.color.textPrimary as ColorValue,
                iconColor: theme.color.textPrimary as ColorValue,
                disabled: false,
              },
              {
                text: "Ban",
                onPress: () => {
                  setTooltipVisible(false);
                  setModalType("ban");
                },
                iconName: "block" as IconName,
                textColor: theme.color.textPrimary as ColorValue,
                iconColor: theme.color.textPrimary as ColorValue,
                disabled: false,
              },
              {
                text: "Remove",
                onPress: () => {
                  setTooltipVisible(false);
                  setModalType("kick");
                },
                iconName: "cancel" as IconName,
                textColor: theme.color.textPrimary as ColorValue,
                iconColor: theme.color.textPrimary as ColorValue,
                disabled: false,
              },
            ].filter((item) => {
              // Filter menu items based on the current user's role permissions.
              return RolePermissions[currentUserRole?.toUpperCase()!].includes(item.text);
            })}
          />
        </View>
      )}

      {/* Render bottom sheet for changing member's role (scope) */}
      {selectedItem && isToolTipDismissed && (
        <CometChatBottomSheet
          isOpen={isBottomSheetVisible}
          doNotOccupyEntireHeight
          onClose={() => {
            setIsBottomSheetVisible(false);
          }}
        >
          <View style={mergedStyle?.changeScope?.container}>
            <View style={mergedStyle.changeScope?.iconContainerStyle}>
              <Icon
                name='change-circle'
                icon={mergedStyle?.changeScope?.icon}
                color={mergedStyle?.changeScope?.iconStyle?.tintColor}
                height={mergedStyle?.changeScope?.iconStyle?.height}
                width={mergedStyle?.changeScope?.iconStyle?.width}
                containerStyle={mergedStyle?.changeScope?.iconStyle}
              />
            </View>

            <Text style={mergedStyle?.changeScope?.titleStyle}>{localize("CHANGE_SCOPE")}</Text>

            <Text style={mergedStyle?.changeScope?.subTitleStyle}>
              {localize("SCOPE_CHANGE_INFO")}
            </Text>

            <View style={mergedStyle?.changeScope?.actionBox}>
              {roles
                // For moderators: do not allow demotion to Participant if already a moderator.
                .filter((role) => {
                  if (currentUserRole === "moderator") {
                    const targetScope = selectedItem.getScope();
                    if (targetScope === "moderator" && role === "Participant") {
                      return false;
                    }
                  }
                  return true;
                })
                .map((role) => {
                  const isDisabled = currentUserRole === "moderator" && role === "Admin";
                  return (
                    <TouchableOpacity
                      key={role}
                      activeOpacity={isDisabled ? 1 : 0.7}
                      onPress={() => {
                        if (!isDisabled) {
                          setSelectedRole(role);
                        }
                      }}
                      style={[
                        { opacity: isDisabled ? 0.5 : 1 },
                        mergedStyle?.changeScope?.actionListStyle,
                      ]}
                    >
                      <Text
                        style={[
                          theme.typography.heading4.medium,
                          { color: theme.color.textPrimary },
                        ]}
                      >
                        {role}
                      </Text>
                      <View
                        style={{
                          height: 24,
                          width: 24,
                          borderRadius: 12,
                          borderWidth: 2,
                          borderColor: theme.color.primary,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        {selectedRole === role && (
                          <View
                            style={{
                              height: 12,
                              width: 12,
                              borderRadius: 6,
                              backgroundColor: theme.color.primary,
                            }}
                          />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
            </View>

            <View style={mergedStyle.changeScope?.buttonContainer}>
              <TouchableOpacity
                style={mergedStyle?.changeScope?.cancelStyle?.containerStyle}
                onPress={() => {
                  setIsBottomSheetVisible(false);
                }}
              >
                <Text style={mergedStyle?.changeScope?.cancelStyle?.textStyle}>
                  {localize("CANCEL")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={mergedStyle?.changeScope?.confirmStyle?.containerStyle}
                onPress={async () => {
                  if (selectedItem && selectedRole) {
                    const currentScope = selectedItem.getScope();
                    const scopeToSet = selectedRole.toLowerCase();

                    // If no change is needed, just close the bottom sheet.
                    if (scopeToSet === currentScope) {
                      setIsBottomSheetVisible(false);
                      setSelectedItem(null);
                      setSelectedRole("Participant");
                      return;
                    }

                    try {
                      await CometChat.updateGroupMemberScope(
                        group.getGuid(),
                        selectedItem.getUid(),
                        scopeToSet as CometChat.GroupMemberScope
                      );

                      // Update the scope of the selected item and refresh the list.
                      selectedItem.setScope(scopeToSet as CometChat.GroupMemberScope);
                      listRef.current?.updateList(selectedItem);

                      setIsBottomSheetVisible(false);

                      // Create an action object to notify about the scope change.
                      let action: CometChat.Action = new CometChat.Action(
                        group["guid"],
                        "groupMember",
                        CometChat.RECEIVER_TYPE.GROUP,
                        CometChat.CATEGORY_ACTION as CometChat.MessageCategory
                      );
                      action.setActionBy(loggedInUser.current);
                      action.setActionOn(selectedItem);
                      action.setActionFor(group);
                      action.setMessage(
                        `${loggedInUser.current.getName()} made ${selectedItem.getName()} ${scopeToSet} `
                      );
                      action.setSentAt(getUnixTimestamp());
                      action.setMuid(String(getUnixTimestampInMilliseconds()));
                      action.setSender(loggedInUser.current);
                      action.setReceiver(group);

                      // Emit the group event for a scope change.
                      CometChatUIEventHandler.emitGroupEvent(
                        CometChatGroupsEvents.ccGroupMemberScopeChanged,
                        {
                          action,
                          updatedUser: selectedItem,
                          scopeChangedTo: scopeToSet,
                          scopeChangedFrom: selectedItem.getScope(),
                          group,
                        }
                      );
                      setSelectedItem(null);
                      setSelectedRole("Participant");
                    } catch (error) {
                      console.error("Error updating user scope:", error);
                    }
                  }
                }}
              >
                <Text style={mergedStyle.changeScope?.confirmStyle?.textStyle}>
                  {localize("SAVE")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </CometChatBottomSheet>
      )}

      {/* Render modal for ban or remove actions if an item is selected */}
      {selectedItem && isToolTipDismissed && (
        <Modal
          animationType='fade'
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalType("")}
        >
          <TouchableOpacity onPress={() => setModalType("")} style={{ flex: 1 }}>
            <View style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)" }} />
          </TouchableOpacity>

          {modalType && (
            <View
              style={{
                ...(modalType === "ban"
                  ? mergedStyle.banModalStyle?.containerStyle
                  : mergedStyle.removeModalStyle?.containerStyle),
              }}
            >
              <View
                style={{
                  ...(modalType === "ban"
                    ? mergedStyle.banModalStyle?.iconContainerStyle
                    : mergedStyle.removeModalStyle?.iconContainerStyle),
                }}
              >
                <Icon
                  name='delete'
                  icon={
                    modalType === "ban"
                      ? mergedStyle.banModalStyle?.icon
                      : mergedStyle.removeModalStyle?.icon
                  }
                  color={
                    modalType === "ban"
                      ? mergedStyle?.banModalStyle?.iconStyle?.tintColor
                      : mergedStyle?.removeModalStyle?.iconStyle?.tintColor
                  }
                  height={
                    modalType === "ban"
                      ? mergedStyle?.banModalStyle?.iconStyle?.height
                      : mergedStyle?.removeModalStyle?.iconStyle?.height
                  }
                  width={
                    modalType === "ban"
                      ? mergedStyle?.banModalStyle?.iconStyle?.width
                      : mergedStyle?.removeModalStyle?.iconStyle?.width
                  }
                  imageStyle={
                    modalType === "ban"
                      ? mergedStyle?.banModalStyle?.iconStyle
                      : mergedStyle?.removeModalStyle?.iconStyle
                  }
                />
              </View>
              <View>
                <Text
                  style={
                    modalType === "ban"
                      ? mergedStyle.banModalStyle?.titleTextStyle
                      : mergedStyle.removeModalStyle?.titleTextStyle
                  }
                >
                  {modalType === "ban"
                    ? `${localize("BAN")} ${selectedItem.getName()} ?`
                    : `${localize("REMOVE")} ${selectedItem.getName()} ?`}
                </Text>

                <Text
                  style={
                    modalType === "ban"
                      ? mergedStyle.banModalStyle?.subTitleTextStyle
                      : mergedStyle.removeModalStyle?.subTitleTextStyle
                  }
                >
                  {modalType === "ban"
                    ? `${localize("BAN_MEMBER_CONFIRM")}${selectedItem.getName()}?`
                    : `${localize("REMOVE_MEMBER_CONFIRM")}${selectedItem.getName()}?`}
                </Text>

                <View
                  style={{
                    ...(modalType === "ban"
                      ? mergedStyle.banModalStyle?.alertContainer
                      : mergedStyle.removeModalStyle?.alertContainer),
                  }}
                >
                  <TouchableOpacity
                    style={{
                      ...(modalType === "ban"
                        ? mergedStyle.banModalStyle?.cancelStyle?.containerStyle
                        : mergedStyle.removeModalStyle?.cancelStyle?.containerStyle),
                    }}
                    onPress={() => setModalType("")}
                  >
                    <Text
                      style={{
                        ...(modalType === "ban"
                          ? mergedStyle.banModalStyle?.cancelStyle?.textStyle
                          : mergedStyle.removeModalStyle?.cancelStyle?.textStyle),
                      }}
                    >
                      {localize("NO")}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      ...(modalType === "ban"
                        ? mergedStyle.banModalStyle?.confirmStyle?.containerStyle
                        : mergedStyle.removeModalStyle?.confirmStyle?.containerStyle),
                    }}
                    onPress={async () => {
                      if (selectedItem) {
                        if (modalType === "ban") {
                          await banGroupMember(selectedItem);
                        } else {
                          await removeGroupMember(group.getGuid(), selectedItem);
                        }
                      }
                    }}
                  >
                    <Text
                      style={{
                        ...(modalType === "ban"
                          ? mergedStyle.banModalStyle?.confirmStyle?.textStyle
                          : mergedStyle.removeModalStyle?.confirmStyle?.textStyle),
                      }}
                    >
                      {localize("YES")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </Modal>
      )}
    </View>
  );
};
