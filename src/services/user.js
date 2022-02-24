import firestore from '@react-native-firebase/firestore';
import {appendReactions} from 'src/redux/reducers/actions';
import {appendVideoReactions} from 'src/redux/reducers/video.actions';
import {login} from 'redux/reducers/actions';

const LikesCollectionName = 'likes';
const VotesCollectionName = 'voting';
const UsersCollectionName = 'users';

const subscribeToVotes = (userId, dispatch, errorCallback) => {
  return firestore()
    .collection(VotesCollectionName)
    .where('uid', '==', userId)
    .onSnapshot(
      (snapshot) => {
        dispatch(appendReactions(snapshot));
      },
      (error) => {
        if (errorCallback) {
          errorCallback(error);
        }
      },
    );
};

const subscribeToLikes = (userId, dispatch, errorCallback) => {
  return firestore()
    .collection(LikesCollectionName)
    .where('uid', '==', userId)
    .onSnapshot(
      (snapshot) => {
        dispatch(appendVideoReactions(snapshot));
      },
      (error) => {
        if (errorCallback) {
          errorCallback(error);
        }
      },
    );
};

const subscribeToUserUpdate = (userId, dispatch, errorCallback) => {
  return firestore()
    .collection(UsersCollectionName)
    .doc(userId)
    .onSnapshot(
      (doc) => {
        dispatch(login({...doc.data(), id: userId}));
      },
      (error) => {
        if (errorCallback) {
          errorCallback(error);
        }
      },
    );
};
export {subscribeToVotes, subscribeToLikes, subscribeToUserUpdate};
