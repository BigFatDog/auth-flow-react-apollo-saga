import { defineMessages } from 'react-intl';

export const USER_NOT_FOUND = 'auth/fail/USER_NOT_FOUND';
export const INVALID_CREDENTIALS = 'auth/fail/INVALID_CREDENTIALS';

export const USER_ALREADY_EXIST = 'auth/fail/USER_ALREADY_EXIST';
export const EMAIL_ALREADY_EXIST = 'auth/fail/EMAIL_ALREADY_EXIST';

export const EMAIL_IS_INVALID = 'auth/fail/EMAIL_IS_INVALID';
export const ALL_ARE_REQUIRED = 'auth/fail/ALL_ARE_REQUIRED';

export default defineMessages({
  userNotFound: {
    id: USER_NOT_FOUND,
    defaultMessage: 'User Not Found',
  },

  invalidCredentials: {
    id: INVALID_CREDENTIALS,
    defaultMessage: 'Invalid Credentials',
  },

  userAlreadyExist: {
    id: USER_ALREADY_EXIST,
    defaultMessage: 'User Already Exists',
  },

  emailAlreadyExists: {
    id: EMAIL_ALREADY_EXIST,
    defaultMessage: 'Email Already Exists',
  },

  emailIsInvalid: {
    id: EMAIL_IS_INVALID,
    defaultMessage: 'Email is Invalid',
  },

  allAreRequired: {
    id: ALL_ARE_REQUIRED,
    defaultMessage: 'All fields are required',
  },
});
