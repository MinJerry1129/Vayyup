import {SOCIAL_APPEND_FOLLOWING, SOCIAL_APPEND_FOLLOWERS,SOCIAL_APPEND_BLOCKERS, SOCIAL_APPEND_BLOCKS, SET_BLOCK_USER} from './action.types';
const initialState = {
  following: [],
  followers: [],
  currentuserblock : 0,
};

export default function (state = initialState, action = {}) {
  if (action.type === SOCIAL_APPEND_FOLLOWING) {
    const {following = []} = state;
    const newItems = [];

    action.payload.docChanges().forEach((change) => {
      const user = change.doc.data();
      const userIndex = following.findIndex((obj) => obj.id === user.id);
      if (change.type === 'added' && userIndex === -1) {
        newItems.push(user);
      } else if (change.type === 'removed' && userIndex > -1) {
        following.splice(userIndex, 1);
      }
    });
    return {
      ...state,
      following: [...following, ...newItems],
    };
  } else if (action.type === SOCIAL_APPEND_FOLLOWERS) {
    const {followers = []} = state;
    const newItems = [];
    action.payload.docChanges().forEach((change) => {
      const user = change.doc.data();
      const userIndex = followers.findIndex((obj) => obj.id === user.id);

      if (change.type === 'added' && userIndex === -1) {
        newItems.push(user);
      } else if (change.type === 'removed' && userIndex > -1) {
        followers.splice(userIndex, 1);
      }
    });

    return {
      ...state,
      followers: [...followers, ...newItems],
    };
  }else if (action.type === SOCIAL_APPEND_BLOCKS) {
    const {blocking = []} = state;
    const newItems = [];

    action.payload.docChanges().forEach((change) => {
      const user = change.doc.data();
      const userIndex = blocking.findIndex((obj) => obj.id === user.id);
      if (change.type === 'added' && userIndex === -1) {
        newItems.push(user);
      } else if (change.type === 'removed' && userIndex > -1) {
        blocking.splice(userIndex, 1);
      }
    });
    return {
      ...state,
      blocking: [...blocking, ...newItems],
    };
  } else if (action.type === SOCIAL_APPEND_BLOCKERS) {
    const {blockers = []} = state;
    const newItems = [];
    action.payload.docChanges().forEach((change) => {
      const user = change.doc.data();
      const userIndex = blockers.findIndex((obj) => obj.id === user.id);

      if (change.type === 'added' && userIndex === -1) {
        newItems.push(user);
      } else if (change.type === 'removed' && userIndex > -1) {
        blockers.splice(userIndex, 1);
      }
    });

    return {
      ...state,
      blockers: [...blockers, ...newItems],
    };
  } else if (action.type === SET_BLOCK_USER) {
    return {...state, currentuserblock: action.payload};
  }
  return state;
}
