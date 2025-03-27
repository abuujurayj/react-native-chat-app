import {CometChat} from '@cometchat/chat-sdk-react-native';
import {
  useTheme,
  CometChatAvatar,
  localize,
  ChatConfigurator,
  CometChatCallButtons,
} from '@cometchat/chat-uikit-react-native';
import {
  GroupTypeConstants,
  UserStatusConstants,
} from '@cometchat/chat-uikit-react-native/src/shared/constants/UIKitConstants';
import {CometChatCompThemeProvider} from '@cometchat/chat-uikit-react-native/src/theme/provider';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Text, View} from 'react-native';

export type CallLogDetailHeaderInterface = {
  user?: CometChat.User;
  /**
   *
   * @type {CometChat.Group}
   *   To pass group object
   */
  group?: CometChat.Group;
};

export const CallLogDetailHeader = (props: CallLogDetailHeaderInterface) => {
  const themeV5 = useTheme();

  const {user, group} = props;

  const [groupObj, setGroupObj] = useState(group);
  const [userStatus, setUserStatus] = useState(
    user && user?.getStatus ? user?.getStatus() : '',
  );

  const receiverTypeRef = useRef(
    user
      ? CometChat.RECEIVER_TYPE.USER
      : group
      ? CometChat.RECEIVER_TYPE.GROUP
      : null,
  );

  useEffect(() => {
    setGroupObj(group);
  }, [group]);

  useEffect(() => {
    setUserStatus(user ? user?.getStatus() : '');
  }, [user]);

  const messageHeaderStyles = useMemo(() => {
    return themeV5.messageHeaderStyles;
  }, [themeV5.messageHeaderStyles]);

  const statusIndicatorType = useMemo(() => {
    if (groupObj?.getType() === GroupTypeConstants.password) {
      return 'protected';
    } else if (groupObj?.getType() === GroupTypeConstants.private) {
      return 'private';
    } else if (userStatus === 'online') {
      return 'online';
    }
    return 'offline';
  }, [userStatus, groupObj]);

  const AvatarWithStatusView = useCallback(() => {
    return (
      <View>
        <CometChatAvatar
          image={
            user
              ? user.getAvatar()
                ? {uri: user.getAvatar()}
                : undefined
              : groupObj
              ? groupObj.getIcon()
                ? {uri: groupObj.getIcon()}
                : undefined
              : undefined
          }
          name={user?.getName() || groupObj?.getName() || ''}
        />
      </View>
    );
  }, [user, groupObj, statusIndicatorType]);

  const SubtitleViewFnc = () => {
    return (
      <Text style={{...themeV5.typography.caption1.regular, color: themeV5.color.textSecondary}}>
        {receiverTypeRef.current === CometChat.RECEIVER_TYPE.GROUP &&
        (groupObj?.['membersCount'] || groupObj?.['membersCount'] === 0)
          ? `${groupObj['membersCount']} ${localize('MEMBERS')}`
          : receiverTypeRef.current === CometChat.RECEIVER_TYPE.USER
          ? userStatus === UserStatusConstants.online
            ? localize('ONLINE')
            : localize('OFFLINE')
          : ''}
      </Text>
    );
  };

  return (
    <CometChatCompThemeProvider
      theme={{
        callButtonStyles: messageHeaderStyles.callButtonStyle,
        avatarStyle: messageHeaderStyles.avatarStyle,
        statusIndicatorStyles: messageHeaderStyles.statusIndicatorStyle,
      }}>
      <View style={{paddingVertical: themeV5.spacing.padding.p5, paddingHorizontal: themeV5.spacing.padding.p4,
        backgroundColor: themeV5.color.background1, flexDirection: 'row',
        gap: themeV5.spacing.padding.p3,
        alignItems: 'center',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: themeV5.color.borderLight
      }}>
        <AvatarWithStatusView />
        <View style={{flex: 1}}>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{...themeV5.typography.heading4.medium, color: themeV5.color.textPrimary}}>
            {user ? user.getName() : groupObj ? groupObj.getName() : ''}
          </Text>
          {<SubtitleViewFnc />}
        </View>
        <View style={{marginLeft: 'auto'}}>
          <CometChatCallButtons
            user={user}
            group={group}
            style={{
              containerStyle: {
                gap: 10,
              },
              audioCallButtonIconStyle: {
                height: 24,
                width: 24,
                tintColor: themeV5.color.iconHighlight,
              },
              videoCallButtonIconStyle: {
                height: 24,
                width: 24,
                tintColor: themeV5.color.iconHighlight,
              },
              audioCallButtonIconContainerStyle: {
                height: 40,
                width: 64,
                paddingVertical: themeV5.spacing.padding.p2,
                paddingHorizontal: themeV5.spacing.padding.p5,
                borderWidth: 1,
                borderRadius: themeV5.spacing.radius.r2,
                borderColor: themeV5.color.borderDefault,
              },
              videoCallButtonIconContainerStyle: {
                height: 40,
                width: 64,
                paddingVertical: themeV5.spacing.padding.p2,
                paddingHorizontal: themeV5.spacing.padding.p5,
                borderWidth: 1,
                borderRadius: themeV5.spacing.radius.r2,
                borderColor: themeV5.color.borderDefault,
              },
            }}
          />
        </View>
      </View>
    </CometChatCompThemeProvider>
  );
};
