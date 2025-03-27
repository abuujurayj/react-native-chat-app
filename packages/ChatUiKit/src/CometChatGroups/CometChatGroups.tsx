import { CometChat } from "@cometchat/chat-sdk-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ImageSourcePropType, ListRenderItem, Text, View } from "react-native";
import { CometChatList, CometChatListActionsInterface, localize } from "../shared";
import { SelectionMode } from "../shared/base/Types";
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
import { GroupStyle } from "./GroupsStyle";
import { Skeleton } from "./Skeleton";
import { Style } from "./style";

// Unique listener IDs for group events and UI events.
const groupListenerId = "grouplist_" + new Date().getTime();
const uiEventListener = "uiEvents_" + new Date().getTime();

/**
 * Props for the CometChatGroups component.
 */
export interface CometChatGroupsInterface {
  /**
   * Custom title view for a group item.
   * @param conversation - The group object.
   * @returns JSX.Element to render as title.
   */
  TitleView?: (conversation: CometChat.Group) => JSX.Element;
  /**
   * Custom subtitle view for a group item.
   * @param item - The group object.
   * @returns JSX.Element to render as subtitle.
   */
  SubtitleView?: (item: CometChat.Group) => JSX.Element;
  /**
   * Custom tail view to render at the end of a group list item.
   * @param item - The group object.
   * @returns JSX.Element for the tail view.
   */
  TrailingView?: (item: CometChat.Group) => JSX.Element;
  /**
   * Custom list item view for rendering a group.
   * @param item - The group object.
   * @returns JSX.Element.
   */
  ItemView?: (item: CometChat.Group) => JSX.Element;
  /**
   * Custom component for the AppBar options, shown at the top-right.
   */
  AppBarOptions?: () => JSX.Element;
  /**
   * Hide the submit (selection) button.
   */
  hideSubmitButton?: boolean;
  /**
   * Custom style for groups.
   */
  style?: DeepPartial<GroupStyle>;
  /**
   * Placeholder text for the search input.
   */
  searchPlaceholderText?: string;
  /**
   * Toggle back button visibility.
   */
  hideBackButton?: boolean;
  /**
   * Selection mode: "none" | "single" | "multiple".
   */
  selectionMode?: SelectionMode;
  /**
   * Callback when group selection is completed.
   * @param items - Array of selected groups.
   */
  onSelection?: (items: Array<CometChat.Group>) => void;
  /**
   * Toggle search box visibility.
   */
  hideSearch?: boolean;
  /**
   * Custom view for the empty state.
   */
  EmptyView?: () => JSX.Element;
  /**
   * Custom view for the error state.
   */
  ErrorView?: () => JSX.Element;
  /**
   * Custom view for the loading state.
   */
  LoadingView?: () => JSX.Element;
  /**
   * Request builder to fetch groups.
   */
  groupsRequestBuilder?: CometChat.GroupsRequestBuilder;
  /**
   * Request builder for search functionality.
   */
  searchRequestBuilder?: CometChat.GroupsRequestBuilder;
  /**
   * Icon to be used for private groups.
   */
  privateGroupIcon?: ImageSourcePropType;
  /**
   * Icon to be used for password-protected groups.
   */
  passwordGroupIcon?: ImageSourcePropType;
  /**
   * Toggle error view visibility.
   */
  hideError?: boolean;
  /**
   * Callback when a group item is pressed.
   * @param item - The group object.
   */
  onItemPress?: (item: CometChat.Group) => void;
  /**
   * Callback when a group item is long pressed.
   * @param item - The group object.
   */
  onItemLongPress?: (item: CometChat.Group) => void;
  /**
   * Callback when an error occurs.
   * @param e - The error object.
   */
  onError?: (e: CometChat.CometChatException) => void;
  /**
   * Callback when the back button is pressed.
   */
  onBack?: () => void;
  /**
   * Hide the header of the group list.
   */
  hideHeader?: boolean;
  /**
   * Custom leading view for a group item.
   * @param item - The group object.
   * @returns JSX.Element.
   */
  LeadingView?: (item: CometChat.Group) => JSX.Element;
}

/**
 * CometChatGroups renders a list of groups with support for search, error/empty/loading views,
 * selection mode, and handling of group events.
 *
 * @param props - Properties as defined in CometChatGroupsInterface.
 * @param ref - Forwarded ref to allow external access to list methods.
 * @returns JSX.Element rendering the groups list.
 */
export const CometChatGroups = React.forwardRef((props: CometChatGroupsInterface, ref: any) => {
  const {
    AppBarOptions = undefined,
    hideSubmitButton,
    style = {},
    searchPlaceholderText = localize("SEARCH"),
    hideBackButton = true,
    selectionMode = "none",
    onSelection = () => {},
    hideSearch = false,
    EmptyView = undefined,
    ErrorView = undefined,
    LoadingView = undefined,
    groupsRequestBuilder = undefined,
    searchRequestBuilder,
    onError = undefined,
    onBack = undefined,
    onItemPress = undefined,
    onItemLongPress = undefined,
    SubtitleView = undefined,
    ItemView = undefined,
    hideError = false,
    hideHeader,
    ...newProps
  } = props;

  // Get theme and mode values from context.
  const theme = useTheme();
  const { mode } = useThemeInternal();

  // Reference to access CometChatList actions.
  const groupListRef = useRef<CometChatListActionsInterface>(null);

  // State to control selection mode and error handling.
  const [selecting, setSelecting] = useState(selectionMode != "none" ? true : false);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [hideSearchError, setHideSearchError] = useState(false);

  // Merge theme styles with provided style overrides.
  const mergedStyle = deepMerge(theme.groupStyles, style);

  // Expose imperative methods via ref.
  React.useImperativeHandle(ref, () => ({
    addGroup: addGroup,
    updateGroup: updateGroup,
    removeGroup: removeGroup,
    getSelectedItems,
  }));

  /**
   * Returns the array of selected group items.
   */
  const getSelectedItems = () => {
    return selectedGroups;
  };

  /**
   * Renders the empty state view when no groups are available.
   */
  const EmptyStateView = useCallback(() => {
    return (
      <View style={{ flex: 1 }}>
        <ErrorEmptyView
          title={localize("NO_GROUPS_AVAILABLE")}
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
      </View>
    );
  }, [mergedStyle, theme]);

  /**
   * Renders the error state view when an error occurs.
   * Also hides the search box when active.
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
              icon={mergedStyle.errorStateStyle.icon || (mode === "dark" ? dark : light)}
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
  }, [mergedStyle, mode, theme]);

  /**
   * Listener callback for group member removal events.
   * Updates the group list to reflect member changes.
   * @param options - Contains event details.
   */
  const handleGroupMemberRemoval = (...options: any) => {
    const group = options[3];
    groupListRef.current!.updateList(group);
  };

  /**
   * Listener callback for group member ban events.
   * @param options - Contains event details.
   */
  const handleGroupMemberBan = (...options: any) => {
    const group = options[3];
    groupListRef.current!.updateList(group);
  };

  /**
   * Listener callback for group member addition events.
   * @param options - Contains event details.
   */
  const handleGroupMemberAddition = (...options: any) => {
    const group = options[3];
    groupListRef.current!.updateList(group);
  };

  /**
   * Listener callback for group member scope change events.
   * @param options - Contains event details.
   */
  const handleGroupMemberScopeChange = (...options: any) => {
    const group = options[4];
    groupListRef.current!.updateList(group);
  };

  /**
   * Updates a group in the list.
   * If the group is not found, nothing is done.
   * @param group - The group object to update.
   */
  const updateGroup = (group: CometChat.Group) => {
    groupListRef.current!.updateList((grp: CometChat.Group) => grp.getGuid() === group.getGuid());
  };

  /**
   * Adds a group to the list at the first position.
   * @param group - The group object to add.
   */
  const addGroup = (group: CometChat.Group) => {
    groupListRef.current!.addItemToList(
      (grp: CometChat.Group) => grp.getGuid() === group.getGuid(),
      0
    );
  };

  /**
   * Removes a group from the list.
   * Also removes it from the selection list if present.
   * @param group - The group object to remove.
   */
  const removeGroup = (group: CometChat.Group) => {
    groupListRef.current!.removeItemFromList(group.getGuid());
    if (selecting) {
      let index = selectedGroups.findIndex(
        (grp: CometChat.Group) => grp.getGuid() === group.getGuid()
      );
      if (index > -1) {
        let selectedItems = [...selectedGroups];
        selectedItems.splice(index, 1);
        setSelectedGroups(selectedItems);
      }
    }
  };

  // Set up group listeners when the component mounts.
  React.useEffect(() => {
    CometChat.addGroupListener(
      groupListenerId,
      new CometChat.GroupListener({
        onGroupMemberScopeChanged: (
          message: CometChat.Action,
          changedUser: CometChat.User,
          newScope: CometChat.GroupMemberScope,
          oldScope: CometChat.GroupMemberScope,
          changedGroup: CometChat.Group
        ) => {
          handleGroupMemberScopeChange(message, changedUser, newScope, oldScope, changedGroup);
        },
        onGroupMemberKicked: (
          message: CometChat.Action,
          kickedUser: CometChat.User,
          kickedBy: CometChat.User,
          kickedFrom: CometChat.Group
        ) => {
          handleGroupMemberRemoval(message, kickedUser, kickedBy, kickedFrom);
        },
        onGroupMemberLeft: (
          message: CometChat.Action,
          leavingUser: CometChat.User,
          group: CometChat.Group
        ) => {
          handleGroupMemberRemoval(message, leavingUser, null, group);
        },
        onGroupMemberBanned: (
          message: CometChat.Action,
          bannedUser: CometChat.User,
          bannedBy: CometChat.User,
          bannedFrom: CometChat.Group
        ) => {
          handleGroupMemberBan(message, bannedUser, bannedBy, bannedFrom);
        },
        onMemberAddedToGroup: (
          message: CometChat.Action,
          userAdded: CometChat.User,
          userAddedBy: CometChat.User,
          userAddedIn: CometChat.Group
        ) => {
          handleGroupMemberAddition(message, userAdded, userAddedBy, userAddedIn);
        },
        onGroupMemberJoined: (
          message: CometChat.Action,
          joinedUser: CometChat.User,
          joinedGroup: CometChat.Group
        ) => {
          handleGroupMemberAddition(message, joinedUser, null, joinedGroup);
        },
      })
    );
    CometChatUIEventHandler.addGroupListener(uiEventListener, {
      ccGroupCreated: ({ group }: { group: CometChat.Group }) => {
        groupListRef.current!.addItemToList(group, 0);
      },
      ccGroupDeleted: ({ group }: { group: CometChat.Group }) => {
        groupListRef.current?.removeItemFromList(group.getGuid());
      },
      ccGroupLeft: ({ leftGroup }: { leftGroup: CometChat.Group }) => {
        leftGroup.setHasJoined(false);
        leftGroup.setMembersCount(leftGroup.getMembersCount() - 1);
        if (leftGroup.getType() == CometChat.GROUP_TYPE.PRIVATE) {
          groupListRef.current?.removeItemFromList(leftGroup.getGuid());
        } else {
          groupListRef.current?.updateList(leftGroup);
        }
      },
      ccGroupMemberKicked: ({ kickedFrom }: { kickedFrom: CometChat.Group }) => {
        if (kickedFrom?.getType() == CometChat.GROUP_TYPE.PRIVATE) {
          groupListRef.current?.removeItemFromList(kickedFrom.getGuid());
        } else {
          kickedFrom?.setHasJoined(false);
          groupListRef.current?.updateList(kickedFrom);
        }
      },
      ccOwnershipChanged: ({ group }: { group: CometChat.Group }) => {
        groupListRef.current?.updateList(group);
      },
      ccGroupMemberAdded: ({ userAddedIn }: { userAddedIn: CometChat.Group }) => {
        groupListRef.current?.updateList(userAddedIn);
      },
      ccGroupMemberJoined: ({ joinedGroup }: { joinedGroup: CometChat.Group }) => {
        joinedGroup.setMembersCount(joinedGroup.getMembersCount() + 1);
        joinedGroup.setScope("participant");
        joinedGroup.setHasJoined(true);
        groupListRef.current?.updateList(joinedGroup);
      },
    });
    return () => {
      CometChat.removeGroupListener(groupListenerId);
      CometChatUIEventHandler.removeGroupListener(uiEventListener);
    };
  }, []);

  return (
    <View style={[Style.container, theme.groupStyles.containerStyle]}>
      <CometChatList
        hideHeader={hideHeader ?? hideHeader}
        onItemLongPress={onItemLongPress}
        onItemPress={onItemPress}
        SubtitleView={
          SubtitleView
            ? SubtitleView
            : (group: CometChat.Group) => (
                <Text
                  style={[
                    style.itemStyle?.subtitleStyle,
                    theme.groupStyles.itemStyle?.subtitleStyle,
                  ]}
                >
                  {group.getMembersCount() +
                    " " +
                    localize(group.getMembersCount() === 1 ? "MEMBER" : "MEMBERS")}
                </Text>
              )
        }
        statusIndicatorType={(group: CometChat.Group) => {
          return group.getType() as CometChatStatusIndicatorInterface["type"];
        }}
        title={localize("GROUPS")}
        hideSearch={hideSearch ? hideSearch : hideSearchError}
        listStyle={mergedStyle}
        LoadingView={LoadingView ?? (() => <Skeleton />)}
        EmptyView={EmptyView ? EmptyView : () => <EmptyStateView />}
        ErrorView={ErrorView ? ErrorView : () => <ErrorStateView />}
        searchPlaceholderText={searchPlaceholderText}
        ref={groupListRef}
        listItemKey='guid'
        requestBuilder={
          groupsRequestBuilder ||
          new CometChat.GroupsRequestBuilder().setLimit(30).setSearchKeyword("")
        }
        searchRequestBuilder={searchRequestBuilder}
        AppBarOptions={AppBarOptions}
        hideBackButton={hideBackButton}
        selectionMode={selectionMode}
        onSelection={onSelection}
        hideSubmitButton={hideSubmitButton}
        ItemView={ItemView}
        onError={onError}
        hideError={hideError}
        onBack={onBack}
        {...newProps}
      />
    </View>
  );
});
