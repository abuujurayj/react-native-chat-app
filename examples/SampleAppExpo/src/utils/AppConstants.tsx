export const AppConstants = {
  fcmProviderId: 'Android-CometChat-Team-Messenger',
  apnsProviderId: 'react-native-staging',
  authKey: '4152b0366478871f0fa8d19a287dd6f5ed5f8eff',
  appId: '26580020f03ff346',
  region: 'in',
  subscriptionType: 'ALL_USERS',
  versionNumber: 'V5.0.2',
  webClientId:
    '950141434859-aaanfrsbgqd9noso8hkivsd8kcv1j5ac.apps.googleusercontent.com',
  iosClientId:
    '950141434859-rpballfvb8n1a9j0l2vu2nnq4r25gd7h.apps.googleusercontent.com',
};

export const SCREEN_CONSTANTS = {
  LOGIN: 'Login',
  APP_CRED: 'AppCredentials',
  SAMPLE_USER: 'SampleUser',
  ONGOING_CALL_SCREEN: 'OngoingCallScreen',
  BOTTOM_TAB_NAVIGATOR: 'BottomTabNavigator',
  CHATS: 'Chats',
  CALLS: 'Calls',
  USERS: 'Users',
  GROUPS: 'Groups',
  CONVERSATION: 'Conversation',
  CREATE_CONVERSATION: 'CreateConversation',
  MESSAGES: 'Messages',
  THREAD_VIEW: 'ThreadView',
  USER_INFO: 'UserInfo',
  GROUP_INFO: 'GroupInfo',
  ADD_MEMBER: 'AddMember',
  TRANSFER_OWNERSHIP: 'TransferOwnershipSection',
  BANNED_MEMBER: 'BannedMember',
  VIEW_MEMBER: 'ViewMembers',
  CALL_LOGS: 'CallLogs',
  CALL_DETAILS: 'CallDetails',
} as const;
