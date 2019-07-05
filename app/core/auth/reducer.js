import produce from 'immer';

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

const initialState = {
  token: null,
  refreshToken: null,
  userId: null,
  userName: null,
  isAuthenticated: false,
  isAuthenticating: true,
  statusText: null,
};

const reducer = (state = initialState, action) =>
  produce(state, draft => {
    switch (action.type) {
      case LOGIN_REQUEST:
      case SIGN_UP_REQUEST:
        draft.isAuthenticating = true;
        draft.isAuthenticated = false;
        draft.statusText = null;
        break;
      case VERIFY_TOKEN_REQUEST: // verify token doesn't change authenticated status
        draft.isAuthenticating = true;
        draft.statusText = null;
        break;
      case LOGIN_SUCCESS:
      case VERIFY_TOKEN_SUCCESS:
      case SIGN_UP_SUCCESS:
        draft.isAuthenticating = false;
        draft.isAuthenticated = true;
        draft.statusText = null;
        draft.token = action.payload.token;
        draft.refreshToken = action.payload.refreshToken;
        draft.userId = action.payload.userId;
        draft.userName = action.payload.userName;
        draft.statusText = null;
        break;
      case LOGIN_FAILURE:
      case VERIFY_TOKEN_FAILURE:
      case SIGN_UP_FAILURE:
        draft.isAuthenticating = false;
        draft.isAuthenticated = false;
        draft.statusText = null;
        draft.token = null;
        draft.refreshToken = null;
        draft.userId = null;
        draft.userName = null;
        draft.statusText = `${action.payload.errorMsg}`;
        break;
      case LOGOUT:
        draft.isAuthenticating = false;
        draft.isAuthenticated = false;
        draft.statusText = null;
        draft.token = null;
        draft.refreshToken = null;
        draft.userId = null;
        draft.userName = null;
        draft.statusText = null;
        break;
      default:
        break;
    }
  });

export default reducer;
export { initialState };
