import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {SCREEN_CONSTANTS} from '../utils/AppConstants';
import AIAgents from '../components/AIAgents';
import {BottomTabParamList} from './types';

// Create the tab navigator.
const Tab = createBottomTabNavigator<BottomTabParamList>();

const BottomTabNavigator = () => {

  return (
    <Tab.Navigator
      initialRouteName="Agents"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {display: 'none'},
      }}>
      <Tab.Screen name={SCREEN_CONSTANTS.AGENTS} component={AIAgents} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
