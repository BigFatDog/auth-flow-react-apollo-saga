import { defineMessages } from 'react-intl';

export const WEB_SERVER_DISCONNECTED = 'system/status/WEB_SERVER_DISCONNECTED';
export const MONGODB_DISCONNECTED = 'system/status/MONGODB_DISCONNECTED';
export const WEB_SOCKET_DISCONNECTED = 'system/status/WEB_SOCKET_DISCONNECTED';
export const GRAPHQL_DISCONNECTED = 'system/status/GRAPHQL_DISCONNECTED';

export const SERVER_NO_RESPONSE = 'system/request/SERVER_NO_RESPONSE';

export default defineMessages({
  webServerDown: {
    id: WEB_SERVER_DISCONNECTED,
    defaultMessage: 'Web Server Cannot be Reached',
  },

  mongodbDown: {
    id: MONGODB_DISCONNECTED,
    defaultMessage: 'Mongodb is down',
  },

  webSocketDown: {
    id: WEB_SOCKET_DISCONNECTED,
    defaultMessage: 'WebSocket Cannot be Connected',
  },

  graphqlDown: {
    id: GRAPHQL_DISCONNECTED,
    defaultMessage: 'GraphQL Cannot be Connected',
  },

  serverNoResponse: {
    id: SERVER_NO_RESPONSE,
    defaultMessage: 'Server no response',
  },
});
