/**
 * Combine all reducers in this file and export the combined reducers.
 */
import { combineReducers } from 'redux-immutable';
import { connectRouter } from 'connected-react-router/immutable';

import SystemReducer from './core/system/reducers';
import AuthReducer from './core/auth/reducer';
import languageReducer from './containers/LanguageProvider/reducer';

import history from './history';

/**
 * Creates the main reducer with the dynamically injected ones
 */
export default function createReducer(injectedReducers) {
  const rootReducer = combineReducers({
    auth: AuthReducer,
    system: SystemReducer,
    language: languageReducer,
    ...injectedReducers,
  });


  // Wrap the root reducer and return a new root reducer with router state
  const mergeWithRouterState = connectRouter(history);
  return mergeWithRouterState(rootReducer);
}
