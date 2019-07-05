import produce from 'immer';

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

const initialState = {
  webServerConnected: true,
  webSocketConnected: true,
  mongodbConnected: true,
  graphqlConnected: true,
};

const reducer = (state = initialState, action) =>
  produce(state, draft => {
    switch (action.type) {
      case WEB_SERVER_DISCONNECTED:
        draft.webServerConnected = false;
        break;
      case WEB_SERVER_CONNECTED:
        draft.webServerConnected = true;
        break;
      case MONGODB_DISCONNECTED:
        draft.mongodbConnected = false;
        break;
      case MONGODB_CONNECTED:
        draft.mongodbConnected = true;
        break;
      case WEB_SOCKET_DISCONNECTED:
        draft.webSocketConnected = false;
        break;
      case WEB_SOCKET_CONNECTED:
        draft.webSocketConnected = true;
        break;
      case GRAPH_QL_SERVER_DISCONNECTED:
        draft.graphqlConnected = false;
        break;
      case GRAPH_QL_SERVER_CONNECTED:
        draft.graphqlConnected = true;
        break;
      default:
        break;
    }
  });

export default reducer;
export { initialState };
