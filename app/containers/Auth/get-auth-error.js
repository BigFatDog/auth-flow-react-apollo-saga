import React from 'react';
import authMessages, {
  INVALID_CREDENTIALS,
  USER_NOT_FOUND,
  ALL_ARE_REQUIRED,
  EMAIL_IS_INVALID,
  USER_ALREADY_EXIST,
  EMAIL_ALREADY_EXIST,
} from '../../core/auth/messages';
import { REQUEST_TIMEOUT } from '../../core/reqeust/messages';
import messages from './messages';
import systemMessages from '../../core/system/messages';
import requestMessages from '../../core/reqeust/messages';
import { FormattedMessage } from 'react-intl';

const getAuthError = (msg, isWebServerConnected = true) => {
  if (isWebServerConnected === false) {
    return <FormattedMessage {...systemMessages.webServerDown} />;
  }

  if (msg != null && msg.includes('Mongo')) {
    return <FormattedMessage {...systemMessages.mongodbDown} />;
  }

  switch (msg) {
    case USER_NOT_FOUND:
      return <FormattedMessage {...authMessages.userNotFound} />;
    case INVALID_CREDENTIALS:
      return <FormattedMessage {...authMessages.invalidCredentials} />;
    case ALL_ARE_REQUIRED:
      return <FormattedMessage {...authMessages.allAreRequired} />;
    case EMAIL_IS_INVALID:
      return <FormattedMessage {...authMessages.emailIsInvalid} />;
    case USER_ALREADY_EXIST:
      return <FormattedMessage {...authMessages.userAlreadyExist} />;
    case EMAIL_ALREADY_EXIST:
      return <FormattedMessage {...authMessages.emailAlreadyExists} />;
    case REQUEST_TIMEOUT:
      return <FormattedMessage {...requestMessages.requestTimeout} />;
    default:
      return <FormattedMessage {...messages.generalError} /> + msg;
  }
};

export default getAuthError;
