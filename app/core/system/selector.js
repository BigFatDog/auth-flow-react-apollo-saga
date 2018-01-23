import { createSelector } from 'reselect';

const selectSystem = state => state.get('system');

const makeSelectWebServerConnected = () =>
  createSelector(selectSystem, authState =>
    authState.get('webServerConnected')
  );

const makeSelectWebSocketConnected = () =>
  createSelector(selectSystem, authState =>
    authState.get('webSocketConnected')
  );

const makeSelectMongodbConnected = () =>
  createSelector(selectSystem, authState => authState.get('mongodbConnected'));

const makeSelectGraphqlConnected = () =>
  createSelector(selectSystem, authState => authState.get('graphqlConnected'));

export {
  makeSelectWebServerConnected,
  makeSelectWebSocketConnected,
  makeSelectMongodbConnected,
  makeSelectGraphqlConnected,
};
