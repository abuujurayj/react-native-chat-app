import {NavigatorScreenParams} from '@react-navigation/native';
import {CometChat} from '@cometchat/chat-sdk-react-native';

export type RootStackParamList = {
  Login: undefined;
  BottomTabNavigator: NavigatorScreenParams<BottomTabParamList>;
  AppCredentials: undefined;
  SampleUser: undefined;
  Messages: {
    user?: CometChat.User;
    group?: CometChat.Group;
    fromMention?: boolean;
    parentMessageId?: string;
  };
};

export type BottomTabParamList = {
  Agents: undefined;
};
