import { fromJS } from 'immutable';

import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  SIGN_UP_REQUEST,
  SIGN_UP_SUCCESS,
  SIGN_UP_FAILURE,
  VERIFY_TOKEN_REQUEST,
  VERIFY_TOKEN_SUCCESS,
  VERIFY_TOKEN_FAILURE,
  LOGOUT,
} from './constants';

const initialState = fromJS({
  token: null,
  refreshToken: null,
  userId: null,
  userName: null,
  isAuthenticated: false,
  isAuthenticating: true,
  statusText: null,
});

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_REQUEST:
    case SIGN_UP_REQUEST:
      return state
        .set('isAuthenticating', true)
        .set('isAuthenticated', false)
        .set('statusText', null);
    case VERIFY_TOKEN_REQUEST: // verify token doesn't change authenticated status
      return state.set('isAuthenticating', true).set('statusText', null);
    case LOGIN_SUCCESS:
    case VERIFY_TOKEN_SUCCESS:
    case SIGN_UP_SUCCESS:
      return state
        .set('isAuthenticating', false)
        .set('isAuthenticated', true)
        .set('statusText', null)
        .set('token', action.payload.token)
        .set('refreshToken', action.payload.refreshToken)
        .set('userId', action.payload.userId)
        .set('userName', action.payload.userName)
        .set('statusText', null);
    case LOGIN_FAILURE:
    case VERIFY_TOKEN_FAILURE:
    case SIGN_UP_FAILURE:
      return state
        .set('isAuthenticating', false)
        .set('isAuthenticated', false)
        .set('statusText', null)
        .set('token', null)
        .set('refreshToken', null)
        .set('userId', null)
        .set('userName', null)
        .set('statusText', `${action.payload.errorMsg}`);
    case LOGOUT:
      return state
        .set('isAuthenticating', false)
        .set('isAuthenticated', false)
        .set('statusText', null)
        .set('token', null)
        .set('refreshToken', null)
        .set('userId', null)
        .set('userName', null)
        .set('statusText', null);
    default:
      return state;
  }
};

export default reducer;
