import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { ChatConfigurator, localize } from "../shared";
import { listners } from "./listners";
import { CometChat } from "@cometchat/chat-sdk-react-native";
import { GroupTypeConstants, UserStatusConstants } from "../shared/constants/UIKitConstants";
import { CometChatUIEventHandler } from "../shared/events/CometChatUIEventHandler/CometChatUIEventHandler";
import { deepMerge } from "../shared/helper/helperFunctions";
import { Icon } from "../shared/icons/Icon";
import { CometChatAvatar } from "../shared/views/CometChatAvatar";
import { CometChatStatusIndicator } from "../shared/views/CometChatStatusIndicator";
import { useTheme } from "../theme";
import { MessageHeaderStyle } from "./styles";
import { CommonUtils } from "../shared/utils/CommonUtils";
import { DeepPartial } from "../shared/helper/types";

export type CometChatMessageHeaderInterface = {
  /**
   * Custom item view. Receives { user, group }.
   */
  ItemView?: ({ user, group }: { user?: CometChat.User; group?: CometChat.Group }) => JSX.Element;
  /**
   * Custom leading view. Receives { user, group }.
   */
  LeadingView?: ({
    user,
    group,
  }: {
    user?: CometChat.User;
    group?: CometChat.Group;
  }) => JSX.Element;
  /**
   * Custom title view. Receives { user, group }.
   */
  TitleView?: ({ user, group }: { user?: CometChat.User; group?: CometChat.Group }) => JSX.Element;
  /**
   * Custom subtitle view. Receives { user, group }.
   */
  SubtitleView?: ({
    user,
    group,
  }: {
    user?: CometChat.User;
    group?: CometChat.Group;
  }) => JSX.Element;
  /**
   * Custom trailing view. Receives { user, group }.
   */
  TrailingView?: ({
    user,
    group,
  }: {
    user?: CometChat.User;
    group?: CometChat.Group;
  }) => JSX.Element;
  /**
   * Custom auxiliary button view. Receives { user, group }.
   */
  AuxiliaryButtonView?: ({
    user,
    group,
  }: {
    user?: CometChat.User;
    group?: CometChat.Group;
  }) => JSX.Element;
  /**
   * User object.
   */
  user?: CometChat.User;
  /**
   * Group object.
   */
  group?: CometChat.Group;
  /**
   * Hide the back button.
   */
  hideBackButton?: boolean;
  /**
   * Callback when back button is pressed.
   */
  onBack?: () => void;
  /**
   * Custom styles.
   */
  style?: DeepPartial<MessageHeaderStyle>;
  /**
   * Error callback.
   */
  onError?: (error: CometChat.CometChatException) => void;
};

interface Translations {
  lastSeen: string;
  minutesAgo: (minutes: number) => string;
  hoursAgo: (hours: number) => string;
}

/** CometChatMessageHeader renders the header for a conversation. */
export const CometChatMessageHeader = (props: CometChatMessageHeaderInterface) => {
  const userStatusListenerId = "user_status_" + new Date().getTime();
  const msgTypingListenerId = "message_typing_" + new Date().getTime();
  const groupListenerId = "head_group_" + new Date().getTime();
  const theme = useTheme();

  const {
    TitleView,
    SubtitleView = null,
    AuxiliaryButtonView,
    user,
    group,
    hideBackButton = true,
    onBack,
    style = {},
    ItemView,
    LeadingView,
    TrailingView,
    onError,
  } = props;

  const [groupObj, setGroupObj] = useState(group);
  const [userStatus, setUserStatus] = useState(user && user.getStatus ? user.getStatus() : "");
  const [typingText, setTypingText] = useState("");
  const receiverTypeRef = useRef(
    user ? CometChat.RECEIVER_TYPE.USER : group ? CometChat.RECEIVER_TYPE.GROUP : null
  );

  useEffect(() => {
    setGroupObj(group);
  }, [group]);

  useEffect(() => {
    setUserStatus(user ? user.getStatus() : "");
  }, [user]);

  const messageHeaderStyles = useMemo(() => {
    return deepMerge(theme.messageHeaderStyles, style);
  }, [theme.messageHeaderStyles, style]);

  const translations: Translations = {
    lastSeen: "Last seen",
    minutesAgo: (minutes: number) => `${minutes} minute${minutes === 1 ? "" : "s"} ago`,
    hoursAgo: (hours: number) => `${hours} hour${hours === 1 ? "" : "s"} ago`,
  };

  /**
   * Returns a formatted last seen string.
   */
  function getLastSeenTime(timestamp: number, translations: Translations): string {
    try {
      if (timestamp === null) return `${translations.lastSeen} Unknown`;

      if (String(timestamp).length === 10) timestamp *= 1000;

      const now = new Date();
      const lastSeen = new Date(timestamp);
      const diffInMillis = now.getTime() - lastSeen.getTime();
      const diffInMinutes = Math.floor(diffInMillis / (1000 * 60));
      const diffInHours = Math.floor(diffInMillis / (1000 * 60 * 60));

      if (diffInMinutes === 0) return `${translations.lastSeen} ${translations.minutesAgo(1)}`;
      if (diffInMinutes < 60)
        return `${translations.lastSeen} ${translations.minutesAgo(diffInMinutes)}`;
      if (diffInHours < 24) return `${translations.lastSeen} ${translations.hoursAgo(diffInHours)}`;

      const isSameYear = lastSeen.getFullYear() === now.getFullYear();
      const dateOptions: Intl.DateTimeFormatOptions = {
        day: "2-digit",
        month: "short",
        ...(isSameYear ? {} : { year: "numeric" }),
      };
      const timeOptions: Intl.DateTimeFormatOptions = {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      };

      const formattedDate = lastSeen.toLocaleDateString(undefined, dateOptions);
      const formattedTime = lastSeen.toLocaleTimeString(undefined, timeOptions);

      if (formattedDate === "Invalid Date" || formattedTime === "Invalid Date") return "Offline";
      return `${translations.lastSeen} ${formattedDate} at ${formattedTime}`;
    } catch (e) {
      errorHandler(e);
      return "";
    }
  }

  /**
   * Renders the back button.
   */
  const BackButton = useCallback(
    () => (
      <TouchableOpacity style={[messageHeaderStyles.backButtonStyle]} onPress={onBack}>
        <Icon
          name='arrow-back-fill'
          size={messageHeaderStyles.backButtonIconStyle.width}
          height={messageHeaderStyles.backButtonIconStyle.height}
          width={messageHeaderStyles.backButtonIconStyle.width}
          color={messageHeaderStyles.backButtonIconStyle.tintColor}
          icon={messageHeaderStyles.backButtonIcon}
          imageStyle={messageHeaderStyles.backButtonIconStyle}
        />
      </TouchableOpacity>
    ),
    [onBack, messageHeaderStyles]
  );

  const statusIndicatorType = useMemo(() => {
    if (groupObj?.getType() === GroupTypeConstants.password) return "protected";
    if (groupObj?.getType() === GroupTypeConstants.private) return "private";
    if (userStatus === "online") return "online";
    return "offline";
  }, [userStatus, groupObj]);

  /**
   * Renders the avatar with a status indicator.
   */
  const AvatarWithStatusView = useCallback(() => {
    try {
      return (
        <View>
          <CometChatAvatar
            style={messageHeaderStyles.avatarStyle}
            image={
              user
                ? user.getAvatar()
                  ? { uri: user.getAvatar() }
                  : undefined
                : groupObj
                ? groupObj.getIcon()
                  ? { uri: groupObj.getIcon() }
                  : undefined
                : undefined
            }
            name={(user?.getName() ?? groupObj?.getName())!}
          />
          {groupObj ? (
            <CometChatStatusIndicator type={statusIndicatorType} />
          ) : (
            !user?.getBlockedByMe() && <CometChatStatusIndicator type={statusIndicatorType} />
          )}
        </View>
      );
    } catch (e) {
      errorHandler(e);
      return <></>;
    }
  }, [user, groupObj, statusIndicatorType, messageHeaderStyles]);

  /**
   * Renders subtitle view content.
   */
  const SubtitleViewFnc = () => {
    try {
      if (typingText !== "")
        return <Text style={[messageHeaderStyles.typingIndicatorTextStyle]}>{typingText}</Text>;

      return (
        <Text style={[messageHeaderStyles.subtitleTextStyle]}>
          {receiverTypeRef.current === CometChat.RECEIVER_TYPE.GROUP &&
          (groupObj?.["membersCount"] || groupObj?.["membersCount"] === 0)
            ? `${groupObj["membersCount"]} ${localize(
                groupObj["membersCount"] === 1 ? "MEMBER" : "MEMBERS"
              )}`
            : receiverTypeRef.current === CometChat.RECEIVER_TYPE.USER &&
              user &&
              !user.getBlockedByMe()
            ? userStatus === UserStatusConstants.online
              ? localize("ONLINE")
              : getLastSeenTime(user.getLastActiveAt(), translations)
            : ""}
        </Text>
      );
    } catch (error) {
      errorHandler(error);
      return <></>;
    }
  };

  /**
   * Error handler to call onError with a proper CometChatException.
   */
  const errorHandler = (error: any) => {
    if (error instanceof CometChat.CometChatException) {
      onError && onError(error);
    } else if (error instanceof Error) {
      onError &&
        onError(
          new CometChat.CometChatException({
            code: "ERR_SYSTEM",
            details: error.stack,
            message: error.message,
          })
        );
    }
  };

  const handleUserStatus = (userDetails: CometChat.User) => {
    if (userDetails.getUid() === user?.getUid()) setUserStatus(userDetails.getStatus());
  };

  const msgTypingIndicator = (typist: CometChat.TypingIndicator, status: string) => {
    if (
      receiverTypeRef.current === CometChat.RECEIVER_TYPE.GROUP &&
      receiverTypeRef.current === typist.getReceiverType() &&
      groupObj?.getGuid() === typist.getReceiverId()
    ) {
      setTypingText(
        status === "typing" ? `${typist.getSender().getName()}: ${localize("IS_TYPING")}` : ""
      );
    } else if (
      receiverTypeRef.current === CometChat.RECEIVER_TYPE.USER &&
      receiverTypeRef.current === typist.getReceiverType() &&
      user?.getUid() === typist.getSender().getUid()
    ) {
      setTypingText(status === "typing" ? localize("TYPING") : "");
    }
  };

  const handleGroupListener = (groupDetails: CometChat.Group) => {
    if (groupDetails?.getGuid() === groupObj?.getGuid() && groupDetails.getMembersCount()) {
      setGroupObj(CommonUtils.clone(groupDetails));
    }
  };

  useEffect(() => {
    try {
      if (user) {
        listners.addListener.userListener({ userStatusListenerId, handleUserStatus });
        receiverTypeRef.current = CometChat.RECEIVER_TYPE.USER;
      }
      if (groupObj) {
        listners.addListener.groupListener({ groupListenerId, handleGroupListener });
        receiverTypeRef.current = CometChat.RECEIVER_TYPE.GROUP;
      }
      listners.addListener.messageListener({ msgTypingListenerId, msgTypingIndicator });
    } catch (error) {
      errorHandler(error);
    }
    return () => {
      try {
        if (groupObj) listners.removeListner.removeGroupListener({ groupListenerId });
        if (user) listners.removeListner.removeUserListener({ userStatusListenerId });
        listners.removeListner.removeMessageListener({ msgTypingListenerId });
      } catch (cleanupError) {
        errorHandler(cleanupError);
      }
    };
  }, []);

  const handleGroupMemberKicked = ({ kickedFrom }: { kickedFrom: CometChat.Group }) => {
    setGroupObj(CommonUtils.clone(kickedFrom));
  };
  const handleGroupMemberBanned = ({ kickedFrom }: { kickedFrom: CometChat.Group }) => {
    setGroupObj(CommonUtils.clone(kickedFrom));
  };
  const handleGroupMemberAdded = ({ userAddedIn }: { userAddedIn: CometChat.Group }) => {
    setGroupObj(CommonUtils.clone(userAddedIn));
  };
  const handleOwnershipChanged = ({ group }: { group: CometChat.Group }) => {
    setGroupObj(CommonUtils.clone(group));
  };

  useEffect(() => {
    try {
      CometChatUIEventHandler.addGroupListener(groupListenerId, {
        ccGroupMemberKicked: (item: any) => handleGroupMemberKicked(item),
        ccGroupMemberBanned: (item: any) => handleGroupMemberBanned(item),
        ccGroupMemberAdded: (item: any) => handleGroupMemberAdded(item),
        ccOwnershipChanged: (item: any) => handleOwnershipChanged(item),
      });
    } catch (e) {
      errorHandler(e);
    }
    return () => {
      try {
        CometChatUIEventHandler.removeGroupListener(groupListenerId);
      } catch (e) {
        errorHandler(e);
      }
    };
  }, []);

  return (
    <>
      {ItemView ? (
        ItemView({ user, group })
      ) : (
        <View style={[messageHeaderStyles.containerStyle]}>
          {hideBackButton !== true && <BackButton />}
          {LeadingView ? LeadingView({ user, group }) : <AvatarWithStatusView />}
          <View style={{ flex: 1 }}>
            {TitleView ? (
              TitleView({ user, group })
            ) : (
              <Text
                numberOfLines={1}
                ellipsizeMode='tail'
                style={[messageHeaderStyles.titleTextStyle]}
              >
                {user ? user.getName() : groupObj ? groupObj.getName() : ""}
              </Text>
            )}
            {SubtitleView ? SubtitleView({ user, group }) : <SubtitleViewFnc />}
          </View>
          <View style={{ flex: 1, flexDirection: "row" }}>
            <View style={{ marginLeft: "auto", flexDirection: "row" }}>
              {AuxiliaryButtonView
                ? AuxiliaryButtonView({ user, group })
                : ChatConfigurator.getDataSource().getAuxiliaryHeaderAppbarOptions(user, group, {
                    callButtonStyle: messageHeaderStyles.callButtonStyle,
                  })}
              {TrailingView && <>{TrailingView({ user, group })}</>}
            </View>
          </View>
        </View>
      )}
    </>
  );
};
