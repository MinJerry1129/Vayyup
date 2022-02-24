import {
  FEEDS_SEARCH,
  FEEDS_SET,
  FEEDS_APPEND,
  FEEDS_UPDATE,
  REACTIONS_SET,
  REACTIONS_APPEND,
  REACTION_DELETE,
  COMPETITION_VIDEO_ACTIVE,
  ENTRYLIST_COMPETITION_VIDEO
} from './action.types';

const initialState = {
  searchTerm: '',
  feeds: [],
  reactions: [],
  currentCompetitionVideo: {id:""},
  entryList:[]
};

export default function (state = initialState, action = {}) {
  switch (action.type) {
    case FEEDS_SEARCH: {
      const {feeds, searchTerm} = action.payload;
      return {
        ...state,
        feeds,
        searchTerm,
      };
    }
    case FEEDS_SET: {
      return {
        ...state,
        feeds: action.payload,
      };
    }
    case FEEDS_APPEND: {
      const {feeds} = state;
      return {
        ...state,
        feeds: [...feeds, ...action.payload],
      };
    }
    case FEEDS_UPDATE: {
      const {entryList} = state;
      const {entry, index} = action.payload;
      entryList[index] = entry;
      return {
        ...state,
        entryList: [...entryList],
      };
    }
    case REACTIONS_SET: {
      return {
        ...state,
        reactions: action.payload,
      };
    }
    case REACTIONS_APPEND: {
      const {reactions = []} = state;
      const newItems = [];
      action.payload.docChanges().forEach(({type, doc}) => {
        const reaction = doc.data();
        if (type === 'added') {
          if (!reactions.find((obj) => obj.entryId === reaction.entryId)) {
            newItems.push(reaction);
          }
        } else if (type === 'removed') {
          const index = reactions.findIndex(
            (obj) => obj.entryId === reaction.entryId,
          );
          reactions.splice(index, 1);
        }
      });

      return {
        ...state,
        reactions: [...reactions, ...newItems],
      };
    }
    case REACTION_DELETE: {
      const {reactions = []} = state;
      return {
        ...state,
        reactions: reactions.filter(
          (obj) => obj.entryId !== action.payload.entryId,
        ),
      };
    }
    case COMPETITION_VIDEO_ACTIVE:{
      return {...state, currentCompetitionVideo: action.payload};
    }
    case ENTRYLIST_COMPETITION_VIDEO: {
      const {entryList} = action.payload;
      return {
        ...state,
        entryList: [...entryList],
      };
    }
    default:
      return state;
  }
}
