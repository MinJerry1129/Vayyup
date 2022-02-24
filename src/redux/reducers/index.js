import {combineReducers} from 'redux';

import auth from './auth';
import settings from './settings';

import feeds from './feeds';
import videos from './videos';
import karaoke from './karaoke';
import social from './social';
import doop from './doop';

const rootReducer = combineReducers({
  settings,
  auth,
  feeds,
  videos,
  karaoke,
  social,
  doop,
});

export default (state, action) => {
  return rootReducer(
    action.type === 'RESET_ACTION' ? undefined : state,
    action,
  );
};
