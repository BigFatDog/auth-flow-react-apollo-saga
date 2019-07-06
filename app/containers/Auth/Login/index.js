import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { func } from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import isEmpty from 'lodash/isEmpty';
import isNull from 'lodash/isNull';
import isUndefined from 'lodash/isUndefined';
import trim from 'lodash/trim';

import { useInjectReducer } from '../../../core/runtime/injectReducer';
import { useInjectSaga } from '../../../core/runtime/injectSaga';
import saga from './saga';

import { loginRequest, loginFailure } from '../../../core/auth/actions';

import messages from '../messages';
import { ALL_ARE_REQUIRED } from '../../../core/auth/messages';
import {
  makeSelectIsAuthenticated,
  makeSelectIsAuthenticating,
  makeSelectMessage,
} from '../../../core/auth/selector';

import {
  makeSelectWebServerConnected,
  makeSelectMongodbConnected,
} from '../../../core/system/selector';

import getAuthError from '../get-auth-error';

import CentralContainer from '../../../components/Auth/CentralContainer';
import ErrorBox from '../../../components/Auth/ErrorBox';
import InputTextWrapper from '../../../components/Auth/InputTextWrapper';
import LoginBox from '../../../components/Auth/LoginBox';
import LoginBoxContainer from '../../../components/Auth/LoginBoxContainer';
import LoginPanel from '../../../components/Auth/LoginPanel';
import SubmitButton from '../../../components/Auth/SubmitButton';
import BottomPrompt from '../../../components/Auth/BottomPrompt';

const isStringSafe = str =>
  !isNull(str) && !isUndefined(str) && !isEmpty(trim(str));

/**
 * google chrome ignores autoComple='off'
 * finest solution: https://stackoverflow.com/questions/12374442/chrome-browser-ignoring-autocomplete-off/38961567#38961567
 *
 */
const Login = props => {
  useInjectSaga({ key: 'login', saga });
  const [username, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const {
    intl,
    isAuthenticated,
    isAuthenticating,
    errorMsg,
    isWebServerConnected,
  } = props;

  const login = () => {
    setSubmitted(true);
    const { loginFailure, onLoginRequest, history } = props;

    if (!isStringSafe(username) || !isStringSafe(password)) {
      loginFailure({ errorMsg: ALL_ARE_REQUIRED });
      return;
    }

    onLoginRequest({
      username,
      password,
      push: history.push,
    });
  };

  const namePlaceholder = intl.formatMessage({ id: messages.username.id });
  const passwordPlaceholder = intl.formatMessage({
    id: messages.password.id,
  });

  let Errors = null;

  if (isAuthenticating === true) {
    Errors = (
      <ErrorBox>
        <i className="fas fa-cog fa-spin error-icon" />{' '}
        <FormattedMessage {...messages.authenticating} />
      </ErrorBox>
    );
  } else if (isAuthenticated === false && submitted === true) {
    Errors = (
      <ErrorBox>{getAuthError(errorMsg, isWebServerConnected)}</ErrorBox>
    );
  }

  return (
    <CentralContainer>
      <LoginBoxContainer>
        <LoginBox>
          <LoginPanel>
            {Errors}

            <form>
              <InputTextWrapper>
                <i className="fas fa-user input-icon" />
                <input
                  type="text"
                  required=""
                  autoComplete="new-password"
                  value={username}
                  placeholder={namePlaceholder}
                  onChange={e => setUserName(e.target.value)}
                  name="username"
                  className="input-text username"
                />
              </InputTextWrapper>
              <InputTextWrapper>
                <i className="fas fa-lock input-icon" />
                <input
                  type="password"
                  required=""
                  autoComplete="new-password"
                  value={password}
                  placeholder={passwordPlaceholder}
                  onChange={e => setPassword(e.target.value)}
                  name="password"
                  className="input-text password"
                />
              </InputTextWrapper>
              <SubmitButton onClick={e => login()}>
                <FormattedMessage {...messages.submit} />
              </SubmitButton>
            </form>
            <BottomPrompt>
              <FormattedMessage {...messages.registerPrompt} />
              &nbsp;
              <Link to="/signup">
                <FormattedMessage {...messages.signUp} />
              </Link>
            </BottomPrompt>
          </LoginPanel>
        </LoginBox>
      </LoginBoxContainer>
    </CentralContainer>
  );
};

Login.propTypes = {
  intl: intlShape.isRequired,
  onLoginRequest: func.isRequired,
  isAuthenticated: PropTypes.bool,
  isAuthenticating: PropTypes.bool,
  errorMsg: PropTypes.string,
};

const mapStateToProps = createStructuredSelector({
  isAuthenticated: makeSelectIsAuthenticated(),
  isAuthenticating: makeSelectIsAuthenticating(),
  errorMsg: makeSelectMessage(),
  isWebServerConnected: makeSelectWebServerConnected(),
  isMongodbConnected: makeSelectMongodbConnected(),
});

const mapDispatchToProps = dispatch => {
  return {
    onLoginRequest: payload => dispatch(loginRequest(payload)),
    loginFailure: payload => dispatch(loginFailure(payload)),
  };
};

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps
);
export default compose(withConnect)(injectIntl(Login));
