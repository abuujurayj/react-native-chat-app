import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Text,
  BackHandler,
  Platform,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import {
  CometChatUIKit,
  CometChatMessageHeader,
  CometChatMessageList,
  CometChatMessageComposer,
  useTheme,
  CometChatUIEventHandler,
  CometChatUIEvents,
  ChatConfigurator,
  useCometChatTranslation,
  Icon,
  CometChatAIAssistantChatHistory,
  CometChatAIAssistantTools,
  CometChatThemeProvider,
} from '@cometchat/chat-uikit-react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../../navigation/types';
import { CometChat } from '@cometchat/chat-sdk-react-native';
import InfoIcon from '../../../assets/icons/InfoIcon';
import { CommonUtils } from '../../../utils/CommonUtils';
import Info from '../../../assets/icons/Info';
import { useActiveChat } from '../../../utils/ActiveChatContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

type Props = StackScreenProps<RootStackParamList, 'Messages'>;

const Messages: React.FC<Props> = ({ route, navigation }) => {
  const { user, group, fromMention = false, parentMessageId: routeParentMessageId } = route.params;
  const loggedInUser = useRef<CometChat.User>(
    CometChatUIKit.loggedInUser!,
  ).current;
  const theme = useTheme();
  const { t } = useCometChatTranslation();
  const themeRef = useRef(theme);
  const navigationRef = useRef(navigation);
  const routeRef = useRef(route);
  const userListenerId = 'app_messages' + new Date().getTime();
  const openmessageListenerId = 'message_' + new Date().getTime();
  const [localUser, setLocalUser] = useState<CometChat.User | undefined>(user);
  const [messageListKey, setMessageListKey] = useState(0);
  const [messageComposerKey, setMessageComposerKey] = useState(0);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  
  // Manage parentMessageId in parent component
  const [parentMessageId, setParentMessageId] = useState<string | undefined>(routeParentMessageId);
  
  const { setActiveChat } = useActiveChat();
  const insets = useSafeAreaInsets();
  
  // Add ref to track streaming state
  const messageComposerRef = useRef<any>(null);

  /** Animation state for drawer */
  const slideAnim = useRef(new Animated.Value(width)).current;

  useEffect(() => {
    if (showHistoryModal) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: width,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [showHistoryModal, slideAnim]);

  /** Agentic user check */
  const isAgenticUser = useCallback((): boolean => {
    if (localUser) {
      return localUser.getRole?.() === '@agentic';
    }
    return false;
  }, [localUser]);
  const agentic = isAgenticUser();

  useEffect(() => {
    // if it’s a user chat
    if (user) {
      setActiveChat({ type: 'user', id: user.getUid() });
    } else if (group) {
      setActiveChat({ type: 'group', id: group.getGuid() });
    }

    // Cleanup on unmount => setActiveChat(null)
    return () => {
      setActiveChat(null);
      // Reset streaming state when leaving chat
      if (messageComposerRef.current?.resetStreaming) {
        messageComposerRef.current.resetStreaming();
      }
    };
  }, [user, group, setActiveChat]);

  useEffect(() => {
    const backAction = () => {
      if (fromMention) {
        navigation.goBack();
      } else {
        navigation.popToTop();
      }
      return true;
    };
    // Add event listener for hardware back press
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  }, [navigation]);

  useEffect(() => {
    CometChatUIEventHandler.addUserListener(userListenerId, {
      ccUserBlocked: (item: { user: CometChat.User }) =>
        handleccUserBlocked(item),
      ccUserUnBlocked: (item: { user: CometChat.User }) =>
        handleccUserUnBlocked(item),
    });

    CometChatUIEventHandler.addUIListener(openmessageListenerId, {
      openChat: ({ user }) => {
        if (user !== undefined) {
          navigation.push('Messages', {
            user,
          });
        }
      },
    });

    return () => {
      CometChatUIEventHandler.removeUserListener(userListenerId);
      CometChatUIEventHandler.removeUIListener(openmessageListenerId);
    };
  }, [localUser]);

  const handleccUserBlocked = ({ user }: { user: CometChat.User }) => {
    setLocalUser(CommonUtils.clone(user));
  };

  const handleccUserUnBlocked = ({ user }: { user: CometChat.User }) => {
    setLocalUser(CommonUtils.clone(user));
  };

  /** Reset messages */
  const handleNewChatClick = useCallback(() => {
    if (messageComposerRef.current?.resetStreaming) {
      messageComposerRef.current.resetStreaming();
    }
    setParentMessageId(undefined);
    setMessageListKey(prev => prev + 1);
    setMessageComposerKey(prev => prev + 1);
    setShowHistoryModal(false);
    navigation.replace('Messages', {
      user,
      group,
    });
  }, [navigation, user, group]);

  /** Open chat history modal */
  const handleChatHistoryClick = useCallback(() => {
    setShowHistoryModal(true);
  }, []);

  /** Handle history message click */
  const handleHistoryMessageClick = useCallback(
    (message: CometChat.BaseMessage) => {
      if (messageComposerRef.current && messageComposerRef.current.stopStreaming) {
        messageComposerRef.current.stopStreaming();
      }
      setShowHistoryModal(false);
      setParentMessageId(message.getId().toString());
      setMessageListKey(prev => prev + 1);
      setMessageComposerKey(prev => prev + 1);
    },
    [],
  );

  /** Handle history error */
  const handleChatHistoryError = useCallback(
    (_error: CometChat.CometChatException) => {},
    [],
  );

  const unblock = async (userToUnblock: CometChat.User) => {
    let uid = userToUnblock.getUid();
    try {
      const response = await CometChat.unblockUsers([uid]);
      const unBlockedUser = await CometChat.getUser(uid);
      if (response) {
        setLocalUser(unBlockedUser);

        // Optionally emit an event or let the server call do the job
        CometChatUIEventHandler.emitUserEvent(
          CometChatUIEvents.ccUserUnBlocked,
          {
            user: unBlockedUser,
          },
        );
      }
    } catch (error) {
      console.error('Error unblocking user:', error);
    }
  };

  // Define app bar options
  const getTrailingView = ({
    user,
    group,
  }: {
    user?: CometChat.User;
    group?: CometChat.Group;
  }) => {
    if (group) {
      if (!loggedInUser) {
        return <></>;
      }
      return (
        <View style={styles.appBarContainer}>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('GroupInfo', {
                group: group,
              });
            }}
          >
            <Icon
              icon={
                <Info color={theme.color.iconPrimary} height={24} width={24} />
              }
            />
          </TouchableOpacity>
        </View>
      );
    }

    if (user && !user.getBlockedByMe()) {
      return (
        <View style={styles.appBarContainer}>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('UserInfo', {
                user: user,
              });
            }}
          >
            <Icon
              icon={
                <InfoIcon
                  color={theme.color.iconPrimary}
                  height={24}
                  width={24}
                />
              }
            />
          </TouchableOpacity>
        </View>
      );
    } else {
      return <></>;
    }
  };

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
          // Get the user by UID and navigate to Messages
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

  /** Theme override for agentic outgoing bubble */
  const providerTheme = useMemo(() => {
    const defaultOutgoingBg =
      theme?.messageListStyles?.outgoingMessageBubbleStyles?.containerStyle?.backgroundColor;
    const defaultTextColor =
      theme?.messageListStyles?.outgoingMessageBubbleStyles?.textBubbleStyles?.textStyle?.color;

    const outgoingOverride = {
      messageComposerStyles: {
        containerStyle: {
          backgroundColor: agentic
            ? theme.color.background3
            : theme?.messageComposerStyles?.containerStyle?.backgroundColor,
        },
      },
      messageListStyles: {
        outgoingMessageBubbleStyles: {
          containerStyle: {
            backgroundColor: agentic
              ? theme.color.background4
              : defaultOutgoingBg,
          },
          textBubbleStyles: {
            textStyle: {
              color: agentic
                ? theme.color.textPrimary
                : defaultTextColor,
            },
          },
          dateStyles: {
            textStyle: {
              color: agentic
                ? theme.color.textSecondary
                : defaultTextColor,
            },
          },
        },
      },
    };

    return {
      light: outgoingOverride,
      dark: outgoingOverride,
      mode: "auto" as "auto",
    };
  }, [agentic, theme]);

  return (
    <CometChatThemeProvider theme={providerTheme}>
      <View style={styles.flexOne}>
      <CometChatMessageHeader
        user={localUser}
        group={group}
        onBack={() => {
          if (fromMention) {
            navigation.goBack();
          } else {
            navigation.popToTop();
          }
        }}
        TrailingView={getTrailingView}
        showBackButton={true}
        hideChatHistoryButton={false}
        hideNewChatButton={false}
        onChatHistoryButtonClick={handleChatHistoryClick}
        onNewChatButtonClick={handleNewChatClick}
      />
      <View style={styles.flexOne}>
        <CometChatMessageList
          key={messageListKey}
          textFormatters={[getMentionsTap()]}
          user={user}
          group={group}
          parentMessageId={parentMessageId}
          // callback signature expects (messageObject, messageBubbleView)
          onThreadRepliesPress={(messageObject, _messageBubbleView) => {
            navigation.navigate('ThreadView', { message: messageObject, user, group });
          }}
          aiAssistantTools={new CometChatAIAssistantTools({
            getCurrentWeather: (args: any) => console.log('Weather args', args),
          })}
          streamingSpeed={10}
        />
      </View>

      {/* Chat History Drawer */}
      {agentic && (
        <Modal visible={showHistoryModal} transparent animationType="none" onRequestClose={() => setShowHistoryModal(false)}>
          <View style={drawerStyles.backdrop}>
            <Animated.View
              style={[
                drawerStyles.drawer,
                { 
                  backgroundColor: theme.color.background1,
                  paddingTop: Platform.OS === 'ios' ? insets.top : 0,
                },
                { transform: [{ translateX: slideAnim }] },
              ]}
            >
              <CometChatAIAssistantChatHistory
                user={localUser}
                group={group}
                onClose={() => setShowHistoryModal(false)}
                onMessageClicked={handleHistoryMessageClick}
                onError={handleChatHistoryError}
                onNewChatButtonClick={handleNewChatClick}
              />
            </Animated.View>
          </View>
        </Modal>
      )}

      {localUser?.getBlockedByMe() ? (
        <View
          style={[
            styles.blockedContainer,
            { backgroundColor: theme.color.background3 },
          ]}
        >
          <Text
            style={[
              theme.typography.button.regular,
              {
                color: theme.color.textSecondary,
                textAlign: 'center',
                paddingBottom: 10,
              },
            ]}
          >
            {t('BLOCKED_USER_DESC')}
          </Text>
          <TouchableOpacity
            onPress={() => unblock(localUser)}
            style={[styles.button, { borderColor: theme.color.borderDefault }]}
          >
            <Text
              style={[
                theme.typography.button.medium,
                styles.buttontext,
                {
                  color: theme.color.textPrimary,
                },
              ]}
            >
              {t('UNBLOCK')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <CometChatMessageComposer
          key={messageComposerKey}
          ref={messageComposerRef}
          parentMessageId={parentMessageId}
          user={localUser}
          group={group}
          keyboardAvoidingViewProps={{
            ...(Platform.OS === 'android'
              ? {}
              : {
                  behavior: 'padding',
                }),
          }}
        />
      )}
    </View>
    </CometChatThemeProvider>
  );
};

const styles = StyleSheet.create({
  flexOne: {
    flex: 1,
  },
  blockedContainer: {
    alignItems: 'center',
    height: 90,
    paddingVertical: 10,
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    borderWidth: 2,
    width: '90%',
    borderRadius: 8,
  },
  buttontext: {
    paddingVertical: 5,
    textAlign: 'center',
    alignContent: 'center',
  },
  appBarContainer: {
    flexDirection: 'row',
    marginLeft: 16,
  },
});

const drawerStyles = StyleSheet.create({
  backdrop: {
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  drawer: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
});

export default Messages;
