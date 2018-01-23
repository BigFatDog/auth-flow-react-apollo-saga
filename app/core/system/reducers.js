import { fromJS } from 'immutable';

import {
  WEB_SERVER_DISCONNECTED,
  WEB_SERVER_CONNECTED,
  MONGODB_DISCONNECTED,
  MONGODB_CONNECTED,
  WEB_SOCKET_DISCONNECTED,
  WEB_SOCKET_CONNECTED,
  GRAPH_QL_SERVER_DISCONNECTED,
  GRAPH_QL_SERVER_CONNECTED,
} from './constants';

const initialState = fromJS({
  webServerConnected: true,
  webSocketConnected: true,
  mongodbConnected: true,
  graphqlConnected: true,
});

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case WEB_SERVER_DISCONNECTED:
      return state.set('webServerConnected', false);
    case WEB_SERVER_CONNECTED:
      return state.set('webServerConnected', true);
    case MONGODB_DISCONNECTED:
      return state.set('mongodbConnected', false);
    case MONGODB_CONNECTED:
      return state.set('mongodbConnected', true);
    case WEB_SOCKET_DISCONNECTED:
      return state.set('webSocketConnected', false);
    case WEB_SOCKET_CONNECTED:
      return state.set('webSocketConnected', true);
    case GRAPH_QL_SERVER_DISCONNECTED:
      return state.set('graphqlConnected', false);
    case GRAPH_QL_SERVER_CONNECTED:
      return state.set('graphqlConnected', true);
    default:
      return state;
  }
};

export default reducer;
