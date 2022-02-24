import {algoliaSearchVideos, algoliaSearchUserVideos} from 'services/algolia';
import {
  LOGIN,
  LOGOUT,
  VIDEOS_SEARCH,
  MYVIDEOS_SEARCH,
  VIDEOS_SET,
  VIDEOS_APPEND,
  VIDEOS_UPDATE,
  VIDEOS_REACTIONS_SET,
  VIDEOS_REACTIONS_APPEND,
  VIDEO_ACTIVE,
  VIDEO_HOME_ACTIVE,
  COMPETITION_VIDEO,
  LOCAL_FEED_VIDEO,
  LOCAL_DELETED_VIDEO,
  MY_VIDEOS_ACTIVE,
  MY_COMPETITIONS_ACTIVE,
  SUCCESS_VIDEO,
} from './action.types';

export const login = (user) => ({
  type: LOGIN,
  payload: user,
});

export const logout = () => ({
  type: LOGOUT,
  payload: {},
});

export const searchVideos =
  (searchTerm, page) => async (dispatch, getState) => {
    const {videos = {}} = getState();
    const {videoPage = 0} = videos;
    let currentPage = videoPage;
    if (page !== undefined) {
      currentPage = page;
    }
    const {hits, isLast, views} = await algoliaSearchVideos(
      searchTerm,
      currentPage,
    );
    dispatch(searchVideosAction(searchTerm, hits, currentPage + 1));
  };

export const searchMyVideos =
  (userId, currentUser) => async (dispatch, getState) => {
    const hits = await algoliaSearchUserVideos(userId, 0, currentUser);
    dispatch(searchMyVideosAction(userId, hits));
  };

export const setMyCompetitionVideos =
  (competitionVideos) => async (dispatch, getState) => {
    dispatch(setMyCompetitionVideosAction(competitionVideos));
  };
export const setMyLocalVideos = (localVideos) => async (dispatch, getState) => {
  dispatch(setMyLocalVideosAction(localVideos));
};
export const setRefreshVideos =
  (isDeletedLocalVideo) => async (dispatch, getState) => {
    dispatch(setRefreshVideosAction(isDeletedLocalVideo));
  };
export const searchVideosAction = (searchTerm, videos, page) => ({
  type: VIDEOS_SEARCH,
  payload: {searchTerm, videos, page},
});

export const searchMyVideosAction = (userId, videos) => ({
  type: MYVIDEOS_SEARCH,
  payload: {userId, videos},
});

export const setVideos = (list) => ({type: VIDEOS_SET, payload: list});
export const appendVideos = (list) => ({type: VIDEOS_APPEND, payload: list});
export const updateVideo = (video, index) => ({
  type: VIDEOS_UPDATE,
  payload: {video, index},
});

export const setVideoReactions = (list) => ({
  type: VIDEOS_REACTIONS_SET,
  payload: list,
});
export const appendVideoReactions = (list) => ({
  type: VIDEOS_REACTIONS_APPEND,
  payload: list,
});

export const setActiveVideo = (id, index) => ({
  type: VIDEO_ACTIVE,
  payload: {id, index},
});

export const setCurrentVideo = (id, index) => ({
  type: VIDEO_HOME_ACTIVE,
  payload: {id, index},
});
export const setMyCurrentVideo = (id, profileVideoId, index) => ({
  type: MY_VIDEOS_ACTIVE,
  payload: {id, profileVideoId, index},
});

export const setMyCompetitionVideosAction = (competitionVideos) => ({
  type: COMPETITION_VIDEO,
  payload: {competitionVideos},
});

export const setMyLocalVideosAction = (localVideos) => ({
  type: LOCAL_FEED_VIDEO,
  payload: {localVideos},
});

export const setRefreshVideosAction = (isDeletedLocalVideo) => ({
  type: LOCAL_DELETED_VIDEO,
  payload: isDeletedLocalVideo,
});

export const setMyCompetitionVideo = (id, index) => ({
  type: MY_COMPETITIONS_ACTIVE,
  payload: {id, index},
});

export const setSuccessVideo = (sucessVideo) => ({
  type: SUCCESS_VIDEO,
  payload: {sucessVideo},
});
