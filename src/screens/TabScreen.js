import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import { connect } from 'react-redux';
import User from 'common-components/icons/User';
import VUBottomTab from 'src/components/VUBottomTab/VUBottomTab';

import Home from 'screens/Home';
import Search from 'screens/Search';
import MyVideos from 'screens/MyVideos';
import Chat from 'screens/Chat';
import { IonIcon } from 'src/icons';
import Profile from './Profile';
// import CompetitionVideoList from 'screens/Search/competitionvideolist';
// import OneCompetitionVideos from 'screens/Search/onecompetitionvideos';
import UserProfile from 'screens/Profile';
import { AppStyles, globalStyles } from 'src/AppStyles';
import ChatRoom from 'screens/Chat/ChatRoom';
import { useSelector } from 'react-redux';

const styles = StyleSheet.create({
  navigator: {
    backgroundColor: 'transparent',
    paddingTop: 4,
    borderTopWidth: 0,
    elevation: 0,
    marginTop: 5,
  },
});

const headerStyle = {
  backgroundColor: AppStyles.color.bgWhite,
  borderBottomWidth: 0,
  shadowOffset: { width: 0, height: 2 },
  shadowColor: '#000',
  shadowOpacity: 0.2,
  elevation: 10,
};

const headerTintColor = AppStyles.color.blueBtnColor;

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const Searchtab = () => {
  return (
    <Stack.Navigator initialRouteName={'Search'}>
      <Stack.Screen
        name="Search"
        component={Search}
        options={{ headerShown: false }}
      />
      {/* <Stack.Screen
        name="CompetitionVideoList"
        component={CompetitionVideoList}
        options={{
          headerShown: false,
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
      /> */}
      <Stack.Screen
        name="UserProfile"
        component={UserProfile}
        options={{
          title: 'Profile',
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
    </Stack.Navigator>
  );
};

const HomeTab = () => {
  return (
    <Stack.Navigator initialRouteName={'Home'}>
      <Stack.Screen
        name="Home"
        component={Home}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="UserProfile"
        component={UserProfile}
        options={{
          title: 'Profile',
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
    </Stack.Navigator>
  );
};

const ProfileTab = () => {
  return (
    <Stack.Navigator initialRouteName={'Profile'}>
      <Stack.Screen
        name="Profile"
        component={Profile}
        options={{ headerShown: false }}
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
    </Stack.Navigator>
  );
};

const ChatTab = () => {
  return (
    <Stack.Navigator initialRouteName={'Chat'}>
      <Stack.Screen
        name="Chat"
        component={Chat}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

// This does the trick
ChatTab.navigationOptions = ({ navigation }) => {
  let tabBarVisible;
  if (navigation.state.routes.length > 1) {
    navigation.state.routes.map(route => {
      if (route.routeName === 'ChatRoom') {
        tabBarVisible = false;
      } else {
        tabBarVisible = true;
      }
    });
  }

  return {
    tabBarVisible,
  };
};

const HomeScreen = () => {
  const { initialRoute } = useSelector(state => ({
    initialRoute: state.settings.initialRoute,
  }));
  return (
    <Tab.Navigator
    screenOptions={{
        style: globalStyles.tabStyl, keyboardHidesTabBar: true

      }}
      barStyle={styles.navigator}
      initialRouteName={initialRoute || "Home"}
      inactiveColor="#C4C4C4"
      activeColor="#fff"
      screenOptions={({ route }) => ({
        title: route.name,
        headerShown: false
      })}
      tabBar={props => {
        const { state, route, navigation } = props;
        return (
          <VUBottomTab route={route} state={state} navigation={navigation} />
        );
      }}>
      <Tab.Screen
        name="Home"
        component={HomeTab}
        options={{
          tabBarLabel: 'Home',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <FontAwesome name="home" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={Searchtab}
        options={{
          headerShown: false,
          tabBarLabel: 'Search',
          tabBarIcon: ({ color }) => (
            <IonIcon name="search" size={24} color={color} />
          ),
          unmountOnBlur: true,

        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatTab}
        options={{
          headerShown: false,
          tabBarLabel: 'Chat',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="wechat" size={24} color={color} />
          ),

        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileTab}
        options={{
          headerShown: false,
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
          unmountOnBlur: true,

        }}
      />
    </Tab.Navigator>
  );
};

const mapStateToProps = state => ({
  user: state.auth.user,
});

export default connect(mapStateToProps)(HomeScreen);