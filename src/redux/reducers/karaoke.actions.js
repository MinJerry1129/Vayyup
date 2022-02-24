import {createNullCache} from '@algolia/cache-common';
import { configKeys } from '../../services/utility';
import {KARAOKE_SEARCH} from './action.types';

const algoliasearch = require('algoliasearch');
const client = algoliasearch(configKeys.algolioAppId, configKeys.algolioAdminKey, {
  responsesCache: createNullCache(), // Disable Cache
});
const algoliaVideoIndex = client.initIndex('karaoke');

export const searchKaraoke = (searchTerm) => async (dispatch) => {
  const response = await algoliaVideoIndex.search(searchTerm, {
    hitsPerPage: 500,
  });
  const {hits = []} = response;
  if (hits.length > 0) {
    dispatch(
      searchKaraokeAction(
        searchTerm,
        hits.filter((hit) => hit.url),
      ),
    );
  } else {
    dispatch(searchKaraokeAction(searchTerm, hits));
  }
};

export const searchKaraokeAction = (searchTerm, videos) => ({
  type: KARAOKE_SEARCH,
  payload: {searchTerm, videos},
});
