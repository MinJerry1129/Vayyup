import {
  TOGGLE_SOUND,
  SETTINGS_SHOW_PROMO,
  SETTINGS_INITIAL,
  SETTINGS_UPGRADE,
} from './action.types';

const initialState = {
  muted: false,
  showPromo: false,
  videoId: null,
  videoType: null,
  upgradeNeeded: false,
};

export default function (state = initialState, action = {}) {
  const { payload } = action;
  switch (action.type) {
    case TOGGLE_SOUND: {
      const { muted } = state;
      return {
        ...state,
        muted: !muted,
      };
    }
    case SETTINGS_SHOW_PROMO:
      return {
        ...state,
        showPromo: payload,
      };
    case SETTINGS_INITIAL:
      return {
        ...state,
        initialRoute: payload.initialRoute,
        initialData: payload.initialData,
      };
    case SETTINGS_UPGRADE:
      return {
        ...state,
        upgradeNeeded: payload,
      };
    default:
      return state;
  }
}
