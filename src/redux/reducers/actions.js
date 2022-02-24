import React from 'react';
import {LOGIN, LOGOUT} from './action.types';
import {createNullCache} from '@algolia/cache-common';
import firebase from '@react-native-firebase/app';
import {getFollowing, getHistory} from 'src/services/social';
import {Text, View} from 'common-components';
import {
  FEEDS_SEARCH,
  FEEDS_SET,
  FEEDS_APPEND,
  FEEDS_UPDATE,
  REACTIONS_SET,
  REACTIONS_APPEND,
  REACTION_DELETE,
  TOGGLE_SOUND,
  SETTINGS_SHOW_PROMO,
  SETTINGS_INITIAL,
  SETTINGS_UPGRADE,
  VIDEO_ACTIVE,
  COMPETITION_VIDEO_ACTIVE,
  ENTRYLIST_COMPETITION_VIDEO,
} from './action.types';
import {configKeys} from '../../services/utility';

export const login = (user) => ({
  type: LOGIN,
  payload: user,
});

export const logout = () => ({
  type: LOGOUT,
  payload: {},
});

const algoliasearch = require('algoliasearch');
const client = algoliasearch(
  configKeys.algolioAppId,
  configKeys.algolioAdminKey,
  {
    responsesCache: createNullCache(), // Disable Cache
  },
);
const algoliaIndex = client.initIndex('entries');
// const algoliaVideoIndex = client.initIndex('videos');

const existence = (value, array) => {
  return array.indexOf(value) > -1; // True: if exists, False: if not exists
};

export const searchFeedsFromAlgolia = async (searchTerm) => {
  const response = await algoliaIndex.search(searchTerm, {
    hitsPerPage: 200,
    filters: 'isPublished:true',
  });
  const {hits = []} = response;
  return hits;
};

export const searchFeeds = (competitionId, searchTerm) => async (dispatch) => {
  const response = await algoliaIndex.search(searchTerm || '', {
    hitsPerPage: 200,
    filters: `competitionId:${competitionId} AND isPublished:true`,
  });

  const user = firebase.auth().currentUser;
  const followings = await getFollowing(user.uid);
  const followingIds = followings.map((x) => x.id);

  const history = await getHistory(user.uid);
  let views = [];
  Object.keys(history).forEach((videoId) => {
    views = [
      ...views,
      {
        videoId,
        time: history[videoId],
      },
    ];
  });
  views = [...views.sort((x, y) => x.time - y.time).map((x) => x.videoId)];

  let {hits = []} = response;
  if (hits.length > 0) {
    const hitsFilteredByUrl = hits.filter((hit) => hit.playback);
    const hitsSortedByFollowing = [
      ...hitsFilteredByUrl.filter((hit) => existence(hit.uid, followingIds)),
      ...hitsFilteredByUrl.filter((hit) => !existence(hit.uid, followingIds)),
    ];
    const hitsSortedByViewed = [
      ...hitsSortedByFollowing.filter((hit) => !existence(hit.id, views)),
      ...hitsSortedByFollowing
        .filter((hit) => existence(hit.id, views))
        .sort((x, y) => views.indexOf(x.id) - views.indexOf(y.id)),
    ];

    dispatch(searchFeedsAction(competitionId, hitsSortedByViewed));
  } else {
    dispatch(searchFeedsAction(competitionId, hits));
  }
};

export const searchFeedsAction = (searchTerm, feeds) => ({
  type: FEEDS_SEARCH,
  payload: {searchTerm, feeds},
});
export const setFeeds = (list) => ({type: FEEDS_SET, payload: list});
export const appendFeeds = (list) => ({type: FEEDS_APPEND, payload: list});
export const updateFeed = (entry, index) => ({
  type: FEEDS_UPDATE,
  payload: {entry, index},
});

export const setReactions = (list) => ({type: REACTIONS_SET, payload: list});
export const appendReactions = (list) => ({
  type: REACTIONS_APPEND,
  payload: list,
});

export const deleteReaction = (reaction) => ({
  type: REACTION_DELETE,
  payload: reaction,
});

export const toggleSound = () => ({type: TOGGLE_SOUND});

export const setShowPromo = (show) => ({
  type: SETTINGS_SHOW_PROMO,
  payload: show,
});

export const setSettingInitial = (initialRoute, initialData) => ({
  type: SETTINGS_INITIAL,
  payload: {
    initialRoute: initialRoute,
    initialData: initialData,
  },
});

export const upgradeNeeded = (needed) => ({
  type: SETTINGS_UPGRADE,
  payload: {upgradeNeeded: needed || true},
});

export const setActiveVideo = (id, index) => ({
  type: VIDEO_ACTIVE,
  payload: {id, index},
});

export const setCompetitionVideo = (id, index) => ({
  type: COMPETITION_VIDEO_ACTIVE,
  payload: {id, index},
});

export const entryListVideos = (entryList) => ({
  type: ENTRYLIST_COMPETITION_VIDEO,
  payload: {entryList},
});
