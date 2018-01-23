import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  VERIFY_TOKEN_REQUEST,
  VERIFY_TOKEN_SUCCESS,
  VERIFY_TOKEN_FAILURE,
  SIGN_UP_REQUEST,
  SIGN_UP_SUCCESS,
  SIGN_UP_FAILURE,
  LOGOUT,
} from './constants';

export function loginRequest(payload) {
  return { type: LOGIN_REQUEST, payload };
}

export function loginSuccess(payload) {
  localStorage.setItem('token', payload.token);
  localStorage.setItem('refreshToken', payload.refreshToken);
  return { type: LOGIN_SUCCESS, payload };
}

export function loginFailure(payload) {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  return { type: LOGIN_FAILURE, payload };
}

export function signUpRequest(payload) {
  return { type: SIGN_UP_REQUEST, payload };
}

export function signUpSuccess(payload) {
  localStorage.setItem('token', payload.token);
  localStorage.setItem('refreshToken', payload.refreshToken);
  return { type: SIGN_UP_SUCCESS, payload };
}

export function signUpFailure(payload) {
  return { type: SIGN_UP_FAILURE, payload };
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  return { type: LOGOUT };
}

export function verifyTokenRequest(payload) {
  return { type: VERIFY_TOKEN_REQUEST, payload };
}

export function verifyTokenSuccess(payload) {
  localStorage.setItem('token', payload.token);
  localStorage.setItem('refreshToken', payload.refreshToken);
  return { type: VERIFY_TOKEN_SUCCESS, payload };
}

export function verifyTokenFailure(payload) {
  localStorage.removeItem('token');
  localStorage.setItem('refreshToken', payload.refreshToken);
  return { type: VERIFY_TOKEN_FAILURE, payload };
}
