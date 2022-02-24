import {createNullCache} from '@algolia/cache-common';
import { configKeys } from '../../services/utility';
import {DOOP_SEARCH} from './action.types';

const algoliasearch = require('algoliasearch');
const client = algoliasearch(configKeys.algolioAppId, configKeys.algolioAdminKey, {
  responsesCache: createNullCache(), // Disable Cache
});
const algoliaVideoIndex = client.initIndex('doop');

export const searchDoops = (searchTerm) => async (dispatch) => {
  const response = await algoliaVideoIndex.search(searchTerm, {
    hitsPerPage: 500,
  });
  const {hits = []} = response;
  if (hits.length > 0) {
    dispatch(
      searchDoopsAction(
        searchTerm,
        hits.filter((hit) => hit.audio),
      ),
    );
  } else {
    dispatch(searchDoopsAction(searchTerm, hits));
  }
};

export const searchDoopsAction = (searchTerm, list) => ({
  type: DOOP_SEARCH,
  payload: {searchTerm, list},
});
