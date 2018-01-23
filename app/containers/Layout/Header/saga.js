import { takeEvery, call, fork } from 'redux-saga/effects';
import { post } from '../../../core/reqeust/post';
import { LOGOUT } from '../../../core/auth/constants';

export function* logout() {
  yield call(post, '/logout');
}

/**
 * Root saga manages watcher lifecycle
 */
export default function* auth() {
  yield fork(takeEvery, LOGOUT, logout);
}
