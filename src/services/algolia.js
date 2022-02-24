import { createNullCache } from '@algolia/cache-common';
import firebase from '@react-native-firebase/app';
import { getFollowing, getHistory } from 'src/services/social';
import { left } from 'styled-system';
import { configKeys } from '../services/utility';

const algoliasearch = require('algoliasearch');
const client = algoliasearch(
  configKeys.algolioAppId,
  configKeys.algolioAdminKey,
  {
    responsesCache: createNullCache(), // Disable Cache
  },
);

const PageSize = 50;
const hitsPerPage = 1000;

const existence = (value, array) => {
  return array.indexOf(value) > -1; // True: if exists, False: if not exists
};

const algoliaSearchVideos = async (searchTerm, page) => {
  const algoliaVideoIndex = client.initIndex('videos');
  const response = await algoliaVideoIndex.search(searchTerm, {
    hitsPerPage: hitsPerPage,
    page: Math.floor((page * PageSize) / hitsPerPage),
    filters: 'isPublished:true',
  });

  const user = firebase.auth().currentUser;
  const followings = await getFollowing(user.uid);
  const followingIds = followings.map(x => x.id);

  const history = await getHistory(user.uid);
  let views = [];
  Object.keys(history).forEach(videoId => {
    views = [
      ...views,
      {
        videoId,
        time: history[videoId],
      },
    ];
  });
  views = [...views.sort((x, y) => x.time - y.time).map(x => x.videoId)];

  const { hits = [], nbPages } = response;
  const isLast = page >= nbPages - 1;
  if (hits.length > 0) {
    const hitsFilteredByPlayBack = hits
      .filter(hit => hit.playback)
      .map(
        ({
          uid,
          createdAt,
          id,
          playback,
          preview,
          thumbnail,
          title,
          url,
          user,
          video,
          videoFileName,
          votes,
          comments,
          views,
          isPublished,
          isVerified,
          isImage,
          likes
        }) => ({
          uid,
          createdAt,
          id,
          playback,
          preview,
          thumbnail,
          title,
          url,
          user,
          video,
          videoFileName,
          votes,
          comments,
          views,
          isPublished,
          isVerified,
          isImage,
          likes
        }),
      );
    const hitsSortedByFollowing = [
      ...hitsFilteredByPlayBack.filter(hit => existence(hit.uid, followingIds)),
      ...hitsFilteredByPlayBack.filter(
        hit => !existence(hit.uid, followingIds),
      ),
    ];
    const hitsSortedByViewed = [
      ...hitsSortedByFollowing.filter(hit => !existence(hit.id, views)),
      ...hitsSortedByFollowing
        .filter(hit => existence(hit.id, views))
        .sort((x, y) => views.indexOf(x.id) - views.indexOf(y.id)),
    ];
    return { hits: hitsSortedByViewed.slice(page * PageSize, (page + 1) * PageSize), isLast, views };
  }
  return { hits, isLast, views };
};

const algoliaSearchUserVideos = async (searchTerm, page, currentUser) => {
  const algoliaVideoIndex = client.initIndex('videos_createdAt_desc');
  let response;
  if (currentUser === true) {
    response = await algoliaVideoIndex.search(searchTerm, {
      hitsPerPage: PageSize,
      page: page,
      filters: 'isImage:false',
    });
  } else {
    response = await algoliaVideoIndex.search(searchTerm, {
      hitsPerPage: PageSize,
      page: page,
      filters: 'isPublished:true AND isImage:false',
    });
  }

  const { hits = [] } = response;
  if (hits.length > 0) {
    return hits
      .filter(hit => hit.playback)
      .map(
        ({
          uid,
          createdAt,
          id,
          playback,
          preview,
          thumbnail,
          title,
          url,
          user,
          video,
          videoFileName,
          votes,
          comments,
          views,
          isPublished,
          isImage,
          likes,
          isVerified,
        }) => ({
          uid,
          createdAt,
          id,
          playback,
          preview,
          thumbnail,
          title,
          url,
          user,
          video,
          videoFileName,
          votes,
          comments,
          views,
          isPublished,
          isImage,
          likes,
          isVerified,
        }),
      );
  }
  return hits;
};

const algoliaSearchCompetitionVideos = async (competitionId, searchTerm) => {
  const algoliaVideoIndex = client.initIndex('entries');
  const response = await algoliaVideoIndex.search(searchTerm || '', {
    hitsPerPage: PageSize,
    filters: `competitionId:${competitionId} AND isPublished:true`,
  });
  const {hits = []} = response;
  return hits;
};

export {
  algoliaSearchVideos,
  algoliaSearchUserVideos,
  algoliaSearchCompetitionVideos,
};

