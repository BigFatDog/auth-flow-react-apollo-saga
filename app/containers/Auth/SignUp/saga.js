import { call, put, fork, race, delay, takeLatest } from 'redux-saga/effects';

import { signUpSuccess, signUpFailure } from '../../../core/auth/actions';
import { post } from '../../../core/reqeust/post';
import { SIGN_UP_REQUEST } from '../../../core/auth/constants';
import { REQUEST_TIMEOUT } from '../../../core/reqeust/messages';

export function* signUp(action) {
  try {
    const { res, timeout } = yield race({
      res: call(post, '/signup', action.payload),
      timeout: delay(10 * 1000),
    });

    if (res) {
      const { userId, userName, token, success, message } = res.data;

      if (success === true) {
        yield put(signUpSuccess({ userId, userName, token }));
        action.payload.push('/');
      } else {
        yield put(signUpFailure({ errorMsg: message }));
      }
    } else {
      yield put(signUpFailure({ errorMsg: REQUEST_TIMEOUT }));
    }
  } catch (err) {
    yield put(signUpFailure({ errorMsg: err }));
  }
}

/**
 * Root saga manages watcher lifecycle
 */
export default function* auth() {
  yield takeLatest(SIGN_UP_REQUEST, signUp);
}
