import React, {useEffect} from 'react';
import {
  StyleSheet,
  Platform,
  View,
  TouchableWithoutFeedback,
  SafeAreaView,
  Text,
} from 'react-native';
import {
  createBottomTabNavigator,
  BottomTabBarButtonProps,
} from '@react-navigation/bottom-tabs';
import {useTheme} from '@cometchat/chat-uikit-react-native';
import {Icon} from '@cometchat/chat-uikit-react-native';
import ChatStackNavigator from './stacks/ChatStackNavigator';
import CallsStackNavigator from './stacks/CallsStackNavigator';
import {BottomTabParamList} from './types';
import GroupStackNavigator from './stacks/GroupStackNavigator';
import UserStackNavigator from './stacks/UserStackNavigator';
import { SCREEN_CONSTANTS } from '../utils/AppConstants';

const Tab = createBottomTabNavigator<BottomTabParamList>();

type IconName =
  | 'chat-fill'
  | 'chat'
  | 'person-fill'
  | 'person'
  | 'call-fill'
  | 'call'
  | 'group-fill'
  | 'group';

const icons: Record<string, {active: IconName; inactive: IconName}> = {
  Chats: {active: 'chat-fill', inactive: 'chat'},
  Users: {active: 'person-fill', inactive: 'person'},
  Calls: {active: 'call-fill', inactive: 'call'},
  Groups: {active: 'group-fill', inactive: 'group'},
};

const CustomTabBarButton = ({children, onPress}: BottomTabBarButtonProps) => (
  <TouchableWithoutFeedback onPress={onPress}>
    <View style={styles.tabButton}>{children}</View>
  </TouchableWithoutFeedback>
);

const BottomTabNavigator = () => {
  const theme = useTheme();

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: theme.color.background1}}>
      <Tab.Navigator
        initialRouteName="Chats"
        screenOptions={({route}) => ({
          headerShown: false,
          animation: 'none',
          tabBarIcon: ({focused}) => {
            const iconSet = icons[route.name];
            if (!iconSet) return null;

            const iconName = focused ? iconSet.active : iconSet.inactive;
            const iconColor = focused
              ? theme.color.primary
              : theme.color.iconSecondary;

            return <Icon name={iconName} color={iconColor} />;
          },
          tabBarShowLabel: true,
          tabBarLabel: ({focused}) =>
            focused ? (
              <View>
                <Text style={[styles.tabLabel, {color: theme.color.primary}]}>
                  {route.name}
                </Text>
              </View>
            ) : null,
          tabBarButton: props => <CustomTabBarButton {...props} />,
          tabBarBackground() {
            return (
              <View
                style={{
                  backgroundColor: theme.color.background1,
                  flex: 1,
                }}
              />
            );
          },
        })}>
        <Tab.Screen
          name={SCREEN_CONSTANTS.CHATS}
          component={ChatStackNavigator}
          options={{
            tabBarStyle: styles.tabBar,
          }}
        />
        <Tab.Screen
          name={SCREEN_CONSTANTS.CALLS}
          component={CallsStackNavigator}
          options={{
            tabBarStyle: styles.tabBar,
          }}
        />
        <Tab.Screen
          name={SCREEN_CONSTANTS.USERS}
          component={UserStackNavigator}
          options={{
            tabBarStyle: styles.tabBar,
          }}
        />
        <Tab.Screen
          name={SCREEN_CONSTANTS.GROUPS}
          component={GroupStackNavigator}
          options={{
            tabBarStyle: styles.tabBar,
          }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    height: Platform.OS === 'ios' ? 80 : 70,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    paddingTop: 15,
    borderTopWidth: 0,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  tabLabel: {
    fontSize: 12,
    marginBottom: 5,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BottomTabNavigator;
