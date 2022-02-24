import firestore from '@react-native-firebase/firestore';
import firebase from '@react-native-firebase/app';
import {
  appendUserFollowing,
  appendUserFollowers,
  appendUserBlocking,
  appendUserBlockers,
} from 'src/redux/reducers/social.actions';

const SocialCollectionName = 'social';
const SocialFollowingCollectionName = 'following';
const SocialFollowersCollectionName = 'followers';
const SocialBlockingCollectionName = 'blocking';
const SocialBlockersCollectionName = 'blockers';

const blockUser = async (user, blockedByUser) => {
  const batch = firestore().batch();
  const blockingRef = firestore()
    .collection(SocialCollectionName)
    .doc(blockedByUser.id)
    .collection(SocialBlockingCollectionName)
    .doc(user.id);
  batch.set(blockingRef, {
    ...user,
  });

  const userRef = firestore()
    .collection('users')
    .doc(user.id);
  batch.update(userRef, {
    [SocialBlockersCollectionName]: firebase.firestore.FieldValue.increment(1),
  });

  const blockerRef = firestore()
    .collection(SocialCollectionName)
    .doc(user.id)
    .collection(SocialBlockersCollectionName)
    .doc(blockedByUser.id);
  batch.set(blockerRef, {
    ...blockedByUser,
  });

  const blockedByRef = firestore()
    .collection('users')
    .doc(blockedByUser.id);
  batch.update(blockedByRef, {
    [SocialBlockingCollectionName]: firebase.firestore.FieldValue.increment(1),
  });

  await batch.commit();
};

const unblockUser = async (user, blockedByUser) => {
  const batch = firestore().batch();
  const blockingRef = firestore()
    .collection(SocialCollectionName)
    .doc(blockedByUser.id)
    .collection(SocialBlockingCollectionName)
    .doc(user.id);
  batch.delete(blockingRef);

  const userRef = firestore()
    .collection('users')
    .doc(user.id);
  batch.update(userRef, {
    [SocialBlockersCollectionName]: firebase.firestore.FieldValue.increment(-1),
  });

  const blockerRef = firestore()
    .collection(SocialCollectionName)
    .doc(user.id)
    .collection(SocialBlockersCollectionName)
    .doc(blockedByUser.id);
  batch.delete(blockerRef);

  const blockedByRef = firestore()
    .collection('users')
    .doc(blockedByUser.id);
  batch.update(blockedByRef, {
    [SocialBlockingCollectionName]: firebase.firestore.FieldValue.increment(-1),
  });

  await batch.commit();
};

const followUser = async (user, followedByUser) => {
 
  const batch = firestore().batch();
  const followingRef = firestore()
    .collection(SocialCollectionName)
    .doc(followedByUser.id)
    .collection(SocialFollowingCollectionName)
    .doc(user.id);
  batch.set(followingRef, {
    ...user,
  });

  // const userRef = firestore().collection('users').doc(user.id);
  // batch.update(userRef, {
  //   [SocialFollowersCollectionName]: firebase.firestore.FieldValue.increment(1),
  // });

  const followerRef = firestore()
    .collection(SocialCollectionName)
    .doc(user.id)
    .collection(SocialFollowersCollectionName)
    .doc(followedByUser.id);
  batch.set(followerRef, {
    ...followedByUser,
  });

  // const followedByRef = firestore().collection('users').doc(followedByUser.id);
  // batch.update(followedByRef, {
  //   [SocialFollowingCollectionName]: firebase.firestore.FieldValue.increment(1),
  // });

  await batch.commit();

  const userRef = firestore()
    .collection('users')
    .doc(user.id);
  const followedByRef = firestore()
    .collection('users')
    .doc(followedByUser.id);

  firestore().runTransaction(async transaction => {
    // Get post data first
    const userSnapshot = await transaction.get(userRef);
    const followedBySnapshot = await transaction.get(followedByRef);

    transaction.update(userRef, {
      [SocialFollowersCollectionName]: userSnapshot.data().followers + 1,
    });
    transaction.update(followedByRef, {
      [SocialFollowingCollectionName]: followedBySnapshot.data().following + 1,
    });
  });
};

const unfollowUser = async (user, followedByUser) => {
  const batch = firestore().batch();
  const followingRef = firestore()
    .collection(SocialCollectionName)
    .doc(followedByUser.id)
    .collection(SocialFollowingCollectionName)
    .doc(user.id);
  batch.delete(followingRef);

  // const userRef = firestore().collection('users').doc(user.id);
  // batch.update(userRef, {
  //   [SocialFollowersCollectionName]:
  //     firebase.firestore.FieldValue.increment(-1),
  // });

  const followerRef = firestore()
    .collection(SocialCollectionName)
    .doc(user.id)
    .collection(SocialFollowersCollectionName)
    .doc(followedByUser.id);
  batch.delete(followerRef);

  // const followedByRef = firestore().collection('users').doc(followedByUser.id);
  // batch.update(followedByRef, {
  //   [SocialFollowingCollectionName]:
  //     firebase.firestore.FieldValue.increment(-1),
  // });

  await batch.commit();

  const userRef = firestore()
    .collection('users')
    .doc(user.id);
  const followedByRef = firestore()
    .collection('users')
    .doc(followedByUser.id);

  firestore().runTransaction(async transaction => {
    // Get post data first
    const userSnapshot = await transaction.get(userRef);
    const followedBySnapshot = await transaction.get(followedByRef);

    transaction.update(userRef, {
      [SocialFollowersCollectionName]: userSnapshot.data().followers - 1,
    });
    transaction.update(followedByRef, {
      [SocialFollowingCollectionName]: followedBySnapshot.data().following - 1,
    });
  });
};

const getBlockers = async userId => {
  const snapshots = await firestore()
    .collection(SocialCollectionName)
    .doc(userId)
    .collection(SocialBlockersCollectionName)
    .get();
  if (!snapshots.empty) {
    const users = [];
    snapshots.forEach(snapshot => {
      users.push(snapshot.data());
    });
    return users;
  }
  return [];
};

const getBlocking = async userId => {
  const snapshots = await firestore()
    .collection(SocialCollectionName)
    .doc(userId)
    .collection(SocialBlockingCollectionName)
    .get();
  if (!snapshots.empty) {
    const users = [];
    snapshots.forEach(snapshot => {
      users.push(snapshot.data());
    });
    return users;
  }
  return [];
};

const getFollowers = async userId => {
  const snapshots = await firestore()
    .collection(SocialCollectionName)
    .doc(userId)
    .collection(SocialFollowersCollectionName)
    .get();
  if (!snapshots.empty) {
    const users = [];
    snapshots.forEach(snapshot => {
      users.push(snapshot.data());
    });
    return users;
  }
  return [];
};

const getFollowing = async userId => {
  const snapshots = await firestore()
    .collection(SocialCollectionName)
    .doc(userId)
    .collection(SocialFollowingCollectionName)
    .get();
  if (!snapshots.empty) {
    const users = [];
    snapshots.forEach(snapshot => {
      users.push(snapshot.data());
    });
    return users;
  }
  return [];
};

const subscribeToBlocking = (userId, dispatch, errorCallback) => {
  return firestore()
    .collection(SocialCollectionName)
    .doc(userId)
    .collection(SocialBlockingCollectionName)
    .onSnapshot(
      snapshot => {
        dispatch(appendUserBlocking(snapshot));
      },
      error => {
        if (errorCallback) {
          errorCallback(error);
        }
      },
    );
};

const subscribeToBlockers = (userId, dispatch, errorCallback) => {
  return firestore()
    .collection(SocialCollectionName)
    .doc(userId)
    .collection(SocialBlockersCollectionName)
    .onSnapshot(
      snapshot => {
        dispatch(appendUserBlockers(snapshot));
      },
      error => {
        if (errorCallback) {
          errorCallback(error);
        }
      },
    );
};

const subscribeToFollowing = (userId, dispatch, errorCallback) => {
  return firestore()
    .collection(SocialCollectionName)
    .doc(userId)
    .collection(SocialFollowingCollectionName)
    .onSnapshot(
      snapshot => {
        dispatch(appendUserFollowing(snapshot));
      },
      error => {
        if (errorCallback) {
          errorCallback(error);
        }
      },
    );
};

const subscribeToFollowers = (userId, dispatch, errorCallback) => {
  return firestore()
    .collection(SocialCollectionName)
    .doc(userId)
    .collection(SocialFollowersCollectionName)
    .onSnapshot(
      snapshot => {
        dispatch(appendUserFollowers(snapshot));
      },
      error => {
        if (errorCallback) {
          errorCallback(error);
        }
      },
    );
};

const voteVideo = async (user, item) => {
  const snapshot = await firestore()
  .collection('likes')
  .where('videoId', '==', item.id)
  .where('uid', '==', user.uid)
  .get();

if (snapshot.empty) {
  const batch = firestore().batch();
  const videoRef = firestore()
    .collection('videos')
    .doc(item.id);
  batch.update(videoRef, {
    votes: firebase.firestore.FieldValue.increment(1),
  });
  const likesRef = firestore()
    .collection('likes')
    .doc();
  batch.set(likesRef, {
    videoId: item.id,
    uid: user.uid,
    version: '1.2.1',
  });

  await batch.commit();
}
};

const unvoteVideo = async (user, item) => {
  const snapshot = await firestore()
  .collection('likes')
  .where('videoId', '==', item.id)
  .where('uid', '==', user.uid)
  .limit(1)
  .get();

if (!snapshot.empty) {
  const batch = firestore().batch();
  const doc = snapshot.docs[0];
  batch.delete(doc.ref);
  const videoRef = firestore()
    .collection('videos')
    .doc(item.id);
  batch.update(videoRef, {
    votes: firebase.firestore.FieldValue.increment(-1),
  });
  await batch.commit();
}
};

const voteEntry = async (user, item) => {
  const snapshot = await firestore()
    .collection('voting')
    .where('entryId', '==', item.id)
    .where('uid', '==', user.uid)
    .get();

  if (snapshot.empty) {
    const batch = firestore().batch();
    const entryRef = firestore()
      .collection('entries')
      .doc(item.id);
    batch.update(entryRef, {
      votes: firebase.firestore.FieldValue.increment(1),
    });
    const votingRef = firestore()
      .collection('voting')
      .doc();
    batch.set(votingRef, {
      entryId: item.id,
      uid: user.uid,
      version: '1.2.1',
    });
    await batch.commit();
  }
};

const unvoteEntry = async (user, item) => {
  const snapshot = await firestore()
    .collection('voting')
    .where('entryId', '==', item.id)
    .where('uid', '==', user.uid)
    .limit(1)
    .get();

  if (!snapshot.empty) {
    const batch = firestore().batch();
    const doc = snapshot.docs[0];
    batch.delete(doc.ref);
    const videoRef = firestore()
      .collection('entries')
      .doc(item.id);
    batch.update(videoRef, {
      votes: firebase.firestore.FieldValue.increment(-1),
    });
    await batch.commit();
  }
};

const feedVideoViewed = async (user, item) => {
  const batch = firestore().batch();
  const videoRef = firestore()
    .collection('videos')
    .doc(item.id);
  batch.update(videoRef, {
    views: firebase.firestore.FieldValue.increment(1),
  });
  let videos = await getHistory(user.uid);
  videos[item.id] = Date.now();
  const historyRef = firestore()
    .collection('histories')
    .doc(user.uid);
  batch.set(historyRef, {
    videos: videos,
  });
  await batch.commit();
};

const getHistory = async userId => {
  const obj = await firestore()
    .collection('histories')
    .doc(userId)
    .get();
  let history = {};
  if (obj.exists) {
    history = obj.data() || {};
  }
  let {videos: videos = {}} = history;
  return videos;
};

const competitionVideoViewed = async (user, item) => {
  const batch = firestore().batch();
  const entryRef = firestore()
    .collection('entries')
    .doc(item.id);
  batch.update(entryRef, {
    views: firebase.firestore.FieldValue.increment(1),
  });
  let videos = await getHistory(user.uid);
  videos[item.id] = Date.now();
  const historyRef = firestore()
    .collection('histories')
    .doc(user.uid);
  batch.set(historyRef, {
    videos: videos,
  });
  await batch.commit();
};

export {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  subscribeToFollowing,
  subscribeToFollowers,
  blockUser,
  unblockUser,
  getBlockers,
  getBlocking,
  subscribeToBlocking,
  subscribeToBlockers,
  voteVideo,
  unvoteVideo,
  voteEntry,
  unvoteEntry,
  feedVideoViewed,
  getHistory,
  competitionVideoViewed,
};
