import {SOCIAL_APPEND_FOLLOWING, SOCIAL_APPEND_FOLLOWERS, SOCIAL_APPEND_BLOCKERS, SOCIAL_APPEND_BLOCKS,SET_BLOCK_USER} from './action.types';

export const appendUserFollowing = (snapshot) => ({
  type: SOCIAL_APPEND_FOLLOWING,
  payload: snapshot,
});

export const appendUserFollowers = (snapshot) => ({
  type: SOCIAL_APPEND_FOLLOWERS,
  payload: snapshot,
});
export const appendUserBlocking = (snapshot) => ({
  type: SOCIAL_APPEND_BLOCKS,
  payload: snapshot,
});
export const appendUserBlockers = (snapshot) => ({
  type: SOCIAL_APPEND_BLOCKERS,
  payload: snapshot,
});
export const setBlockCurrentUser = (flag) => ({
  type: SET_BLOCK_USER,
  payload: flag,
});