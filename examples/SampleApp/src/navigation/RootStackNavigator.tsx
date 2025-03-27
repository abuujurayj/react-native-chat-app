import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import BottomTabNavigator from './BottomTabNavigator';
import {SCREEN_CONSTANTS} from '../utils/AppConstants';
import {useTheme} from '@cometchat/chat-uikit-react-native';
import {RootStackParamList} from './types';
import {navigationRef, processPendingNavigation} from './NavigationService';
import SampleUser from '../components/login/SampleUser';
import AppCredentials from '../components/login/AppCredentials';

type Props = {
  isLoggedIn: boolean;
};

const Stack = createStackNavigator<RootStackParamList>();

const RootStackNavigator = ({isLoggedIn}: Props) => {
  const theme = useTheme();  
  const NavigationTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: theme.color.background1 as string,
    },
  };
  
  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        processPendingNavigation();
      }}
      theme={NavigationTheme}>
      <Stack.Navigator
        initialRouteName={
          isLoggedIn
            ? SCREEN_CONSTANTS.BOTTOM_TAB_NAVIGATOR
            : SCREEN_CONSTANTS.SAMPLER_USER
        }
        screenOptions={{
          gestureEnabled: true,
          headerShown: false,
          animation:'slide_from_right'
        }}>
        <Stack.Screen
          name={SCREEN_CONSTANTS.BOTTOM_TAB_NAVIGATOR}
          component={BottomTabNavigator}
        />
        <Stack.Screen
          name={SCREEN_CONSTANTS.APP_CRED}
          component={AppCredentials}
        />
        <Stack.Screen
          name={SCREEN_CONSTANTS.SAMPLER_USER}
          component={SampleUser}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootStackNavigator;
