import React from 'react';
import {Text} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import {useDispatch, useSelector} from 'react-redux';
import {setShowPromo} from 'src/redux/reducers/actions';
import firebase from '@react-native-firebase/app';

import TabScreen from 'screens/TabScreen';
import CompetitionDetails from 'screens/CompetitionDetails';
import Record from 'screens/Record';
import Preview from 'screens/Record/Preview';
import VideoSubmitted from 'screens/VideoSubmitted';
import Comment from 'screens/Comment';
import Reply from 'screens/Comment/Reply';
import EditProfile from 'screens/Profile/EditProfile';
import Onboarding from 'screens/OnBoarding';
import CompetitionVideos from 'screens/CompetitionVideos';
import Profile from 'screens/Profile';
import Settings from 'screens/Profile/Settings';
import Connections from 'screens/Connections';
import PromoVideo from 'components/PromoVideo';
import MyVideos from 'screens/MyVideos';
import OneCompetitionVideos from 'screens/Search/onecompetitionvideos';

import CompetitionVideo from 'screens/CompetitionVideo';
import CompetitionVideoList from 'screens/Search/competitionvideolist';

import ContactUs from 'screens/Profile/ContactUs';
import BlockUserList from 'screens/Profile/BlockUserList';
import Success from 'screens/Record/Success';
import AddCaptions from 'screens/Record/AddCaptions';
import {AppStyles, globalStyles} from 'src/AppStyles';
import EmailValidationScreen from 'screens/OnBoarding/EmailValidationScreen';

import ChatRoom from 'screens/Chat/ChatRoom';
import CreateGroupChat from 'screens/Chat/CreateGroupChat';
import GroupChatRoom from 'screens/Chat/GroupChatRoom';
import ArchiveUsers from 'screens/Chat/ArchiveUsers';
import SettingGroupChat from 'screens/Chat/SettingGroupChat';
import EditGroupChat from 'screens/Chat/EditGroupChat';
import AddGroupMember from 'screens/Chat/AddGroupMember';

import {isUserEmailVerified} from 'services/auth';
import Splash from 'screens/OnBoarding/Splash';
import SliderFilter from 'screens/Record/SliderFilter';

const Stack = createStackNavigator();

const headerStyle = {
  backgroundColor: AppStyles.color.bgWhite,
  borderBottomWidth: 0,
  shadowOffset: {width: 0, height: 2},
  shadowColor: '#000',
  shadowOpacity: 0.2,
  elevation: 10,
};

const headerTintColor = AppStyles.color.blueBtnColor;
const AppStack = (onloading) => {
  const {videoId, videoType} = useSelector((state) => ({
    videoId: state.settings.videoId,
    videoType: state.settings.videoType,
  }));

  const initialRoute = isUserEmailVerified(firebase.auth().currentUser)
    ? videoId
      ? 'CompetitionVideo'
      : 'Splash'
    : 'EmailValidation';
  return (
    <Stack.Navigator
      mode="modal"
      initialRouteName={initialRoute}
      detachInactiveScreens={false}>
      <Stack.Screen
        name="Splash"
        component={Splash}
        initialParams={{onloading}}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="PromoVideo"
        component={PromoVideo}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="VayyUp"
        component={TabScreen}
        options={{
          title: 'Vayy Up',
          headerShown: false,
          headerStyle,
          headerTintColor: headerTintColor,
        }}
      />
      <Stack.Screen
        name="CompetitionDetails"
        component={CompetitionDetails}
        options={{
          header: () => null,
        }}
      />
      <Stack.Screen
        name="Record"
        component={Record}
        options={{
          title: 'Record View',
          headerShown: false,
          headerStyle,
          headerTintColor: headerTintColor,
          headerTitle: {fontSize: 20},
        }}
      />
      <Stack.Screen
        name="Preview"
        component={Preview}
        options={{
          title: 'Preview View',
          headerShown: false,
          headerStyle,
          headerTintColor: headerTintColor,
        }}
      />
      <Stack.Screen
        name="VideoSubmitted"
        component={VideoSubmitted}
        options={{
          title: 'Success',
          headerShown: false,
          headerStyle,
          headerTintColor: headerTintColor,
        }}
      />

      <Stack.Screen
        name="AddCaptions"
        component={AddCaptions}
        options={{
          title: 'AddCaptions',
          headerShown: false,
          headerStyle,
          headerTintColor: headerTintColor,
        }}
      />

      <Stack.Screen
        name="Comment"
        component={Comment}
        options={{
          title: 'Comment',
          headerShown: false,
          headerStyle,
          headerTintColor: headerTintColor,
        }}
      />

      <Stack.Screen
        name="Reply"
        component={Reply}
        options={{
          title: 'Reply',
          headerShown: false,
          headerStyle,
          headerTintColor: headerTintColor,
        }}
      />
      <Stack.Screen
        name="UserVideos"
        component={MyVideos}
        options={{
          title: 'User Videos',
          headerShown: false,
          headerStyle,
          headerTintColor: headerTintColor,
        }}
      />

      <Stack.Screen
        name="OneCompetitionVideos"
        component={OneCompetitionVideos}
        options={{
          title: 'Competition Videos',
          headerShown: false,
          headerStyle,
          headerTintColor: headerTintColor,
        }}
      />

      <Stack.Screen
        name="EditProfile"
        component={EditProfile}
        options={{
          title: 'Edit Profile',
          headerShown: false,
          headerStyle,
          headerTintColor: headerTintColor,
        }}
      />
      <Stack.Screen
        name="Onboarding"
        component={Onboarding}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="CompetitionVideos"
        component={CompetitionVideos}
        options={{
          title: 'Competition Videos',
          headerShown: false,
          headerStyle,
          headerTintColor: headerTintColor,
        }}
      />
      <Stack.Screen
        name="UserProfile"
        component={Profile}
        options={{
          title: 'Profile',
          headerShown: false,
          headerStyle,
          headerTintColor: headerTintColor,
        }}
      />
      <Stack.Screen
        name="Connections"
        component={Connections}
        options={{
          title: 'Connections',
          headerShown: false,
          headerStyle,
          headerTintColor: headerTintColor,
        }}
      />
      <Stack.Screen
        name="CompetitionVideo"
        component={CompetitionVideo}
        options={{
          headerShown: false,
        }}
        initialParams={{videoId, videoType}}
      />
      <Stack.Screen
        name="Settings"
        component={Settings}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="CompetitionVideoList"
        component={CompetitionVideoList}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="ContactUs"
        component={ContactUs}
        options={{
          title: 'Contact us',
          headerShown: false,
          headerStyle,
          headerTintColor: headerTintColor,
        }}
      />
      <Stack.Screen
        name="BlockUserList"
        component={BlockUserList}
        options={{
          // title: 'Blocked Users',
          headerShown: false,
          // headerStyle,
          // headerTintColor: headerTintColor,
        }}
      />
      <Stack.Screen
        name="Success"
        component={Success}
        options={{
          title: 'Excellent',
          headerShown: false,
          headerStyle,
          headerTintColor: headerTintColor,
        }}
      />
      <Stack.Screen
        name="EmailValidation"
        component={EmailValidationScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="ChatRoom"
        component={ChatRoom}
        options={{
          title: 'ChatRoom',
          headerShown: false,
          headerStyle,
          headerTintColor: headerTintColor,
        }}
      />
      <Stack.Screen
        name="CreateGroupChat"
        component={CreateGroupChat}
        options={{
          title: 'CreateGroupChat',
          headerShown: false,
          headerStyle,
          headerTintColor: headerTintColor,
        }}
      />
      <Stack.Screen
        name="GroupChatRoom"
        component={GroupChatRoom}
        options={{
          title: 'GroupChatRoom',
          headerShown: false,
          headerStyle,
          headerTintColor: headerTintColor,
        }}
      />
      <Stack.Screen
        name="SettingGroupChat"
        component={SettingGroupChat}
        options={{
          title: 'SettingGroupChat',
          headerShown: false,
          headerStyle,
          headerTintColor: headerTintColor,
        }}
      />
      <Stack.Screen
        name="EditGroupChat"
        component={EditGroupChat}
        options={{
          title: 'EditGroupChat',
          headerShown: false,
          headerStyle,
          headerTintColor: headerTintColor,
        }}
      />
      <Stack.Screen
        name="AddGroupMember"
        component={AddGroupMember}
        options={{
          title: 'AddGroupMember',
          headerShown: false,
          headerStyle,
          headerTintColor: headerTintColor,
        }}
      />
      <Stack.Screen
        name="ArchiveUsers"
        component={ArchiveUsers}
        options={{
          title: 'ArchiveUsers',
          headerShown: false,
          headerStyle,
          headerTintColor: headerTintColor,
        }}
      />
    </Stack.Navigator>
  );
};

export default AppStack;
