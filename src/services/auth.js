import {useState} from 'react';
import firebase from '@react-native-firebase/app';
import {GoogleSignin} from '@react-native-community/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  subscribeToVotes,
  subscribeToLikes,
  subscribeToUserUpdate,
} from 'src/services/user';
import {subscribeToFollowing, subscribeToFollowers} from 'src/services/social';

import {setReactions} from 'src/redux/reducers/actions';

import {logout} from 'redux/reducers/actions';
import {configKeys} from './utility';

export const isUserEmailVerified = authUser => {
  const {emailVerified} = authUser;
  return emailVerified || authUser.providerData[0].providerId !== 'password';
};

export const useFirebaseAuth = (dispatch, setLoading) => {
  const cleanUpFirebaseAuth = () => {};

  const cleanUpUserDetails = async () => {
    await AsyncStorage.removeItem('first-time');
    await AsyncStorage.removeItem('sent');
    dispatch(logout());
    dispatch(setReactions([]));
  };

  const initializeFirebaseAuth = (verifiedUser, unVerifiedUser) => {
    GoogleSignin.configure({
      webClientId: configKeys.googleWebClientId,
    });
    firebase.auth().onAuthStateChanged(async authUser => {
      // Wait for few seconds.
      setTimeout(() => {
        setLoading(false);
      }, 2000);

      if (authUser) {
        if (isUserEmailVerified(authUser)) {
          await verifiedUser(authUser);
        } else {
          await unVerifiedUser(authUser);
        }
        return;
      }

      cleanUpFirebaseAuth();
      cleanUpUserDetails();
    });
  };

  return [initializeFirebaseAuth, cleanUpFirebaseAuth];
};

export const useVayyUpFirebase = () => {
  let reactionsUnsubscribe;
  let userUnsubscribe;
  let videoUnsubscribe;
  let followingUnsubscribe;
  let followersUnsubscribe;

  const subscribe = (uid, dispatch) => {
    reactionsUnsubscribe = subscribeToVotes(uid, dispatch);
    videoUnsubscribe = subscribeToLikes(uid, dispatch);
    userUnsubscribe = subscribeToUserUpdate(uid, dispatch);
    followingUnsubscribe = subscribeToFollowing(uid, dispatch);
    followersUnsubscribe = subscribeToFollowers(uid, dispatch);
  };

  const unsubscribe = () => {
    if (reactionsUnsubscribe) {
      reactionsUnsubscribe();
    }
    if (userUnsubscribe) {
      userUnsubscribe();
    }
    if (videoUnsubscribe) {
      videoUnsubscribe();
    }
    if (followingUnsubscribe) {
      followingUnsubscribe();
    }
    if (followersUnsubscribe) {
      followersUnsubscribe();
    }
  };

  return [subscribe, unsubscribe];
};
