import {DOOP_SEARCH} from './action.types';

const initialState = {
  searchTerm: '',
  list: [],
};

export default function (state = initialState, action = {}) {
  switch (action.type) {
    case DOOP_SEARCH: {
      const {list, searchTerm} = action.payload;
      return {
        ...state,
        list,
        searchTerm,
      };
    }
    default:
      return state;
  }
}
