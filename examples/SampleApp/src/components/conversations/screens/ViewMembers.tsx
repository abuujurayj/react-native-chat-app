import React from 'react';
import { BackHandler, View } from 'react-native';
import {
  CometChatGroupMembers,
  useTheme,
} from '@cometchat/chat-uikit-react-native';
import {
  useRoute,
  useNavigation,
  RouteProp,
  useFocusEffect,
} from '@react-navigation/native';
import { RootStackParamList } from '../../../navigation/types';

const ViewMembers: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'ViewMembers'>>();
  const navigation = useNavigation();
  const { group } = route.params;
  const theme = useTheme();

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        // Navigate back to message screen (same as your onPress handler)
        navigation.goBack();
        return true; // Prevent default back behavior
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => subscription.remove();
    }, [navigation]),
  );

  return (
    <View style={[{ flex: 1, backgroundColor: theme.color.background1 }]}>
      <CometChatGroupMembers
        group={group}
        onBack={() => {
          navigation.goBack();
        }}
        selectionMode="none"
        showBackButton={true}
      />
    </View>
  );
};

export default ViewMembers;
