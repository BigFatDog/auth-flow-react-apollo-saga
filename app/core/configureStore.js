import { createStore, applyMiddleware, compose } from 'redux';
import { routerMiddleware } from 'connected-react-router';
import createSagaMiddleware from 'redux-saga';
import isUndefined from 'lodash/isUndefined';
import axios from 'axios';

import { post } from './reqeust/post';
import createReducer from '../reducers';
import { loginSuccess, loginFailure, verifyTokenFailure } from './auth/actions';
import { webServerDown } from './system/actions';

const sagaMiddleware = createSagaMiddleware();

export default function configureStore(initialState = {}, history) {
  // Create the store with two middlewares
  // 1. sagaMiddleware: Makes redux-sagas work
  // 2. routerMiddleware: Syncs the location/URL path to the state
  const middlewares = [sagaMiddleware, routerMiddleware(history)];

  const enhancers = [applyMiddleware(...middlewares)];

  // If Redux DevTools Extension is installed use it, otherwise use Redux compose
  /* eslint-disable no-underscore-dangle */
  const composeEnhancers =
    process.env.NODE_ENV !== 'production' &&
    typeof window === 'object' &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
          // TODO Try to remove when `react-router-redux` is out of beta, LOCATION_CHANGE should not be fired more than once after hot reloading
          // Prevent recomputing reducers for `replaceReducer`
          shouldHotReload: false,
        })
      : compose;
  /* eslint-enable */

  const store = createStore(
    createReducer(),
    initialState,
    composeEnhancers(...enhancers)
  );

  // Extensions
  store.runSaga = sagaMiddleware.run;
  store.injectedReducers = {}; // Reducer registry
  store.injectedSagas = {}; // Saga registry

  // general interceptors for all xhr
  axios.interceptors.request.use(
    function(config) {
      const token = localStorage.getItem('token');
      // const refreshToken = localStorage.getItem('refreshToken');
      config.headers.Authorization = token ? `Bearer ${token}` : null;
      // config.headers['x-token'] = token;
      // config.headers['x-refresh-token'] = refreshToken;

      return config;
    },
    function(err) {
      return Promise.reject(err);
    }
  );

  axios.interceptors.response.use(
    response => {
      return response;
    },
    error => {
      // net::ERR_NAME_NOT_RESOLVED
      // net::ERR_CONNECTION_REFUSED
      // net::ERR_BLOCKED_BY_CLIENT
      // net::ERR_TUNNEL_CONNECTION_FAILED (when using proxy)
      if (isUndefined(error.response)) {
        if (error.message.includes('Network Error')) {
          store.dispatch(webServerDown({ errorMsg: error.message }));
          return Promise.reject(error.message);
        }
      }
      if (error.response.status === 401) {
        console.log('unauthorized, logging out ...');
        store.dispatch(verifyTokenFailure({ errorMsg: error.message }));
      }

      return Promise.reject(error.response);
    }
  );

  // redux storage will be lost on page refresh.
  // so verify token during init
  if (
    localStorage.getItem('token') === null ||
    localStorage.getItem('refreshToken') === null
  ) {
    store.dispatch(loginFailure({ errorMsg: 'already logout' }));
  } else {
    post('/verifyToken')
      .then(tokeRes => {
        if (tokeRes.data.success === true) {
          const { userId, userName, token, refreshToken } = tokeRes.data;
          store.dispatch(
            loginSuccess({ userId, userName, token, refreshToken })
          );
        } else {
          store.dispatch(loginFailure({ errorMsg: tokeRes.data.message }));
        }
      })
      .catch(e => {
        store.dispatch(loginFailure({ errorMsg: e }));
      });
  }

  // Make reducers hot reloadable, see http://mxs.is/googmo
  /* istanbul ignore next */
  if (module.hot) {
    module.hot.accept('../reducers', () => {
      store.replaceReducer(createReducer(store.injectedReducers));
    });
  }

  return store;
}
