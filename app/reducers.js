/**
 * Combine all reducers in this file and export the combined reducers.
 */
import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';

import SystemReducer from './core/system/reducers';
import AuthReducer from './core/auth/reducer';
import languageReducer from './containers/LanguageProvider/reducer';

import history from './history';

/**
 * Creates the main reducer with the dynamically injected ones
 */
export default function createReducer(injectedReducers) {
  return combineReducers({
    auth: AuthReducer,
    system: SystemReducer,
    language: languageReducer,
    router: connectRouter(history),
    ...injectedReducers,
  });
}
