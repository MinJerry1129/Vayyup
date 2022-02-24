import React, {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dynamicLinks from '@react-native-firebase/dynamic-links';
import AuthStack from './AuthStack';
import AppStack from './AppStack';
import {configKeys} from '../services/utility';
import {VUView, VayyUpLogo} from 'common-components';
import {AppStyles} from 'src/AppStyles';
import {useFirebaseAuth, useVayyUpFirebase} from 'src/services/auth';
import {setShowPromo} from 'src/redux/reducers/actions';
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import {setSettingInitial} from '../redux/reducers/actions';
import {Image} from 'react-native';

const AppNavigation = () => {
  const [loading, setLoading] = useState(true);
  const [onloadStack, setOnloadStack] = useState('firstTime');
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const navigationRef = React.createRef();
  const dispatch = useDispatch();

  const [initializeFirebaseAuth, cleanUpFirebaseAuth] = useFirebaseAuth(
    dispatch,
    setLoading,
  );
  const [subscribe, unsubscribe] = useVayyUpFirebase();

  const handleDynamicLink = (link) => {
    // Handle dynamic link inside your own application
    if (link !== null) {
      handleDynamicLinkRouting(link.url);
    }
  };
  const handleDynamicLinkRouting = (url) => {
    let urlArray = url.split('/');
    let videoId = urlArray[urlArray.length - 1];
    let videoType = urlArray[urlArray.length - 2];
    if (isAuthenticated) {
      navigationRef.current?.navigate('CompetitionVideo', {
        videoId,
        videoType,
      });
    } else {
      dispatch(
        setSettingInitial('CompetitionVideo', {
          videoId,
          videoType,
        }),
      );
    }
  };
  const _onNotification = (data) => {
    switch (data.type) {
      case 'profile':
        if (isAuthenticated) {
          navigationRef.current?.navigate('UserProfile', {
            userId: data.uid,
            showBack: true,
          });
        } else {
          dispatch(
            setSettingInitial('UserProfile', {
              userId: data.uid,
              showBack: true,
            }),
          );
        }
        break;
      case 'videos':
      case 'entries':
        if (isAuthenticated) {
          navigationRef.current?.navigate('CompetitionVideo', {
            videoId: data.videoId,
            videoType: data.type,
          });
        } else {
          dispatch(
            setSettingInitial('CompetitionVideo', {
              videoId: data.videoId,
              videoType: data.type,
            }),
          );
        }
        break;
      case 'chatroom':
        if (isAuthenticated) {
          navigationRef.current?.navigate('ChatRoom', {
            currentuser: {
              id: data.id,
              fullname: data.fullname,
              profile: data.profile,
            },
          });
        } else {
          dispatch(
            setSettingInitial('ChatRoom', {
              currentuser: {
                id: data.id,
                fullname: data.fullname,
                profile: data.profile,
              },
            }),
          );
        }
        break;
      case 'chats':
        if (isAuthenticated) {
          navigationRef.current?.navigate('Chat');
        } else {
          dispatch(setSettingInitial('Chat', null));
        }
        break;
      case 'start':
      case 'end':
      case 'vote':
        if (isAuthenticated) {
          navigationRef.current?.navigate('CompetitionDetails', {
            competition: JSON.parse(data.competition),
          });
        } else {
          dispatch(
            setSettingInitial('CompetitionDetails', {
              competition: JSON.parse(data.competition),
            }),
          );
        }
        break;
      default:
        break;
    }
  };
  useEffect(async () => {
    PushNotification.configure({
      // (optional) Called when Token is generated (iOS and Android)
      onRegister: function (token) {
        AsyncStorage.setItem('fcmToken', token.token);
      },

      // (required) Called when a remote or local notification is opened or received
      onNotification: function (notification) {
        if (notification.userInteraction) {
          _onNotification(notification.data);
        }
        // process the notification here

        // required on iOS only
        if (Platform.OS === 'ios') {
          notification.finish(PushNotificationIOS.FetchResult.NoData);
        }
      },
      // Android only
      senderID: configKeys.fcmSenderId,
      popInitialNotification: true,
      // iOS only
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      requestPermissions: true,
    });

    dynamicLinks()
      .getInitialLink()
      .then((link) => {
        if (link !== null) {
          handleDynamicLinkRouting(link.url);
        }
      });
    const unsubscribeDynamiclink = dynamicLinks().onLink(handleDynamicLink);
    async function verifiedUser({uid}) {
      subscribe(uid, dispatch);
      const fcmToken = await AsyncStorage.getItem('fcmToken');

      if (fcmToken) {
        firestore()
          .collection('users')
          .doc(uid)
          .update({fcmToken})
          .then((response) => {})
          .catch((error) => {
            console.log('Error', error);
          });
      }
      const firstTime = await AsyncStorage.getItem('first-time');
      if (firstTime === 'already-logged') {
        setOnloadStack('alreadyLogged');
        navigationRef.current?.navigate('PromoVideo');
        dispatch(setShowPromo(true));
      } else {
        setOnloadStack('firstTime');
        navigationRef.current?.navigate('Onboarding', {uid});
      }
    }

    const unVerifiedUser = ({uid}) => {
      subscribe(uid, dispatch);
      navigationRef.current?.navigate('EmailValidation');
    };

    initializeFirebaseAuth(verifiedUser, unVerifiedUser);

    const cleanUp = () => {
      cleanUpFirebaseAuth();
      unsubscribe();
      unsubscribeDynamiclink();
      cleanUpDeeplinking();
    };

    return cleanUp;
  }, [dispatch, navigationRef, onloadStack]);

  if (loading) {
    return (
      <VUView
        bg={AppStyles.color.bgWhite}
        flex={1}
        justifyContent="center"
        alignItems="center">
        {/* <VayyUpLogo size={100} /> */}
        <Image
          source={require('../../assets/logo-5.png')}
          style={{
            width: 120,
            height: 120,
          }}
          resizeMode={'contain'}
        />
      </VUView>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      {isAuthenticated ? <AppStack onloading={onloadStack} /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigation;
