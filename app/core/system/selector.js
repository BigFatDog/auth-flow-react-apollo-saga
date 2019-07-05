import { createSelector } from 'reselect';
import { initialState } from './reducers';

const selectSystem = state => state.system || initialState;

const makeSelectWebServerConnected = () =>
  createSelector(
    selectSystem,
    authState => authState.webServerConnected
  );

const makeSelectWebSocketConnected = () =>
  createSelector(
    selectSystem,
    authState => authState.webSocketConnected
  );

const makeSelectMongodbConnected = () =>
  createSelector(
    selectSystem,
    authState => authState.mongodbConnected
  );

const makeSelectGraphqlConnected = () =>
  createSelector(
    selectSystem,
    authState => authState.graphqlConnected
  );

export {
  makeSelectWebServerConnected,
  makeSelectWebSocketConnected,
  makeSelectMongodbConnected,
  makeSelectGraphqlConnected,
};
