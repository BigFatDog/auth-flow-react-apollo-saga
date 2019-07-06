/**
 * Combine all reducers in this file and export the combined reducers.
 */

import { connectRouter } from 'connected-react-router';
import history from "../../app/history";
import {combineReducers} from "redux";
import AuthReducer from "../../app/core/auth/reducer";
import SystemReducer from "../../app/core/system/reducers";
import languageReducer from "../../app/containers/LanguageProvider/reducer";

/*
 * routeReducer
 *
 * The reducer merges route location changes into our immutable state.
 * The change is necessitated by moving to react-router-redux@4
 *
 */

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
