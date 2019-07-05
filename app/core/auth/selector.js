import { createSelector } from 'reselect';
import { initialState } from './reducer';

const selectAuth = state => state.auth || initialState;

const makeSelectToken = () =>
  createSelector(
    selectAuth,
    authState => authState.token
  );

const makeSelectRefreshToken = () =>
  createSelector(
    selectAuth,
    authState => authState.refreshToken
  );

const makeSelectUserId = () =>
  createSelector(
    selectAuth,
    authState => authState.userId
  );

const makeSelectUserName = () =>
  createSelector(
    selectAuth,
    authState => authState.userName
  );

const makeSelectIsAuthenticated = () =>
  createSelector(
    selectAuth,
    authState => authState.isAuthenticated
  );

const makeSelectIsAuthenticating = () =>
  createSelector(
    selectAuth,
    authState => authState.isAuthenticating
  );

const makeSelectMessage = () =>
  createSelector(
    selectAuth,
    authState => authState.statusText
  );

export {
  makeSelectToken,
  makeSelectRefreshToken,
  makeSelectUserId,
  makeSelectUserName,
  makeSelectIsAuthenticated,
  makeSelectIsAuthenticating,
  makeSelectMessage,
};
