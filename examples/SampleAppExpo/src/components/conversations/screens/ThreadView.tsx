import React, { useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  BackHandler,
} from 'react-native';
import {
  RouteProp,
  useRoute,
  useNavigation,
  useFocusEffect,
} from '@react-navigation/native';
import {
  CometChatThreadHeader,
  CometChatMessageList,
  CometChatMessageComposer,
  useCometChatTranslation,
  CometChatUIKit,
  ChatConfigurator,
} from '@cometchat/chat-uikit-react-native';
import {Icon} from '@cometchat/chat-uikit-react-native';
import {useTheme} from '@cometchat/chat-uikit-react-native';
import {RootStackParamList} from '../../../navigation/types';
import ArrowBack from '../../../assets/icons/ArrowBack';
import { StackNavigationProp } from '@react-navigation/stack';
import { CometChat } from '@cometchat/chat-sdk-react-native';

type ThreadViewRouteProp = RouteProp<RootStackParamList, 'ThreadView'>;
type ThreadViewNavProp = StackNavigationProp<RootStackParamList>;

const ThreadView = () => {
  const { params } = useRoute<ThreadViewRouteProp>();
  const navigation = useNavigation<ThreadViewNavProp>(); // <-- added navigation
  const { goBack } = navigation;
  const theme = useTheme();
  const {t}= useCometChatTranslation()

  const loggedInUser = useRef<CometChat.User>(
    CometChatUIKit.loggedInUser!,
  ).current;

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        goBack();
        return true; // Prevent default behavior
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => subscription.remove();
    }, [goBack]),
  );

  const {message, user, group} = params || {};

  if (!message) {
    return null;
  }

  const getMentionsTap = useCallback(() => {
    const mentionsFormatter =
      ChatConfigurator.getDataSource().getMentionsFormatter(
        loggedInUser,
        theme,
      );
    if (user) mentionsFormatter.setUser(user);
    if (group) mentionsFormatter.setGroup(group);

    mentionsFormatter.setOnMentionClick(
      (_message: CometChat.BaseMessage, uid: string) => {
        if (uid !== loggedInUser.getUid()) {
          CometChat.getUser(uid)
            .then((mentionedUser: CometChat.User) => {
              navigation.push('Messages', {
                user: mentionedUser,
                fromMention: true,
              });
            })
            .catch((error: any) => {
              console.error('Error fetching mentioned user:', error);
            });
        }
      },
    );
    return mentionsFormatter;
  }, [user, group, loggedInUser, navigation, theme]);

  return (
    <View style={{backgroundColor: theme.color.background1, flex: 1}}>
      {/* Custom Header */}
      <View style={styles.headerStyle}>
        <TouchableOpacity style={styles.iconStyle} onPress={() => goBack()}>
          <Icon
            icon={
              <ArrowBack
                color={theme.color.iconPrimary}
                height={24}
                width={24}
              />
            }
          />
        </TouchableOpacity>
        <View style={styles.textStyle}>
          <Text
            style={[
              theme.typography.heading1.bold,
              {color: theme.color.textPrimary},
            ]}>
            {t('THREAD')}
          </Text>
          <Text
            style={[
              theme.typography.caption1.regular,
              {color: theme.color.textSecondary},
            ]}>
            {user ? user?.getName() : group?.getName()}
          </Text>
        </View>
      </View>

      {/* Thread Header */}
      <CometChatThreadHeader parentMessage={message} />

      {/* Threaded Message List */}
      <View style={{flex: 1}}>
        <CometChatMessageList
          user={user}
          group={group}
          parentMessageId={message.getId().toString()}
          textFormatters={[getMentionsTap()]}
        />
      </View>

      {/* Message Composer for Thread */}
      <CometChatMessageComposer
        user={user}
        group={group}
        parentMessageId={message.getId()}
        onError={(error: any) => console.error('Composer Error:', error)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  headerStyle: {
    paddingVertical: 10,
    paddingLeft: 10,
    flexDirection: 'row',
  },
  iconStyle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textStyle: {
    paddingLeft: 10,
    alignItems: 'flex-start',
  },
});

export default ThreadView;
