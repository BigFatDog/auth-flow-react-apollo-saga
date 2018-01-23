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

export function webServerDown(payload) {
  return { type: WEB_SERVER_DISCONNECTED, payload };
}

export function webServerUp(payload) {
  return { type: WEB_SERVER_CONNECTED, payload };
}

export function mongodbDown(payload) {
  return { type: MONGODB_DISCONNECTED, payload };
}

export function mongodbUp() {
  return { type: MONGODB_CONNECTED };
}

export function webSocketDown(payload) {
  return { type: WEB_SOCKET_DISCONNECTED, payload };
}

export function webSocketUp(payload) {
  return { type: WEB_SOCKET_CONNECTED, payload };
}

export function graphQlServerDown(payload) {
  return { type: GRAPH_QL_SERVER_DISCONNECTED, payload };
}

export function graphQlServerUp(payload) {
  return { type: GRAPH_QL_SERVER_CONNECTED, payload };
}
