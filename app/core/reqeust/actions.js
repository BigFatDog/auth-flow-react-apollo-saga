import { REQUEST_TIMEOUT } from './constants';

export function requestTimeout() {
  return { type: REQUEST_TIMEOUT };
}
