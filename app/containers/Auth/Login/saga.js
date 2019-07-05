import { call, put, fork, race, takeLatest, delay } from 'redux-saga/effects';

import { loginSuccess, loginFailure } from '../../../core/auth/actions';

import { post } from '../../../core/reqeust/post';
import { LOGIN_REQUEST } from '../../../core/auth/constants';
import { REQUEST_TIMEOUT } from '../../../core/reqeust/messages';

export function* login(action) {
  try {
    const { res, timeout } = yield race({
      res: call(post, '/login', action.payload),
      timeout: delay(10 * 1000),
    });

    if (res) {
      const {
        userId,
        userName,
        token,
        refreshToken,
        success,
        message,
      } = res.data;

      if (success === true) {
        yield put(loginSuccess({ userId, userName, token, refreshToken }));
        yield call(action.payload.push, '/');
      } else {
        yield put(loginFailure({ errorMsg: message }));
      }
    } else {
      yield put(loginFailure({ errorMsg: REQUEST_TIMEOUT }));
    }
  } catch (err) {
    yield put(loginFailure({ errorMsg: err }));
  }
}

/**
 * Root saga manages watcher lifecycle
 */
export default function* auth() {
  yield takeLatest(LOGIN_REQUEST, login);
}
