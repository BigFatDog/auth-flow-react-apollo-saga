import { createSelector } from 'reselect';

const selectAuth = state => state.get('auth');

const makeSelectToken = () =>
  createSelector(selectAuth, authState => authState.get('token'));

const makeSelectRefreshToken = () =>
  createSelector(selectAuth, authState => authState.get('refreshToken'));

const makeSelectUserId = () =>
  createSelector(selectAuth, authState => authState.get('userId'));

const makeSelectUserName = () =>
  createSelector(selectAuth, authState => authState.get('userName'));

const makeSelectIsAuthenticated = () =>
  createSelector(selectAuth, authState => authState.get('isAuthenticated'));

const makeSelectIsAuthenticating = () =>
  createSelector(selectAuth, authState => authState.get('isAuthenticating'));

const makeSelectMessage = () =>
  createSelector(selectAuth, authState => authState.get('statusText'));

export {
  makeSelectToken,
  makeSelectRefreshToken,
  makeSelectUserId,
  makeSelectUserName,
  makeSelectIsAuthenticated,
  makeSelectIsAuthenticating,
  makeSelectMessage,
};
