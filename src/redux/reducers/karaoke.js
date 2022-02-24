import {KARAOKE_SEARCH} from './action.types';

const initialState = {
  searchTerm: '',
  videos: [],
};

export default function (state = initialState, action = {}) {
  switch (action.type) {
    case KARAOKE_SEARCH: {
      const {videos, searchTerm} = action.payload;
      return {
        ...state,
        videos,
        searchTerm,
      };
    }
    default:
      return state;
  }
}
