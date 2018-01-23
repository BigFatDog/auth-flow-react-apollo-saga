import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { instanceOf, func } from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { Link } from 'react-router-dom';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import isEmpty from 'lodash/isEmpty';
import isNull from 'lodash/isNull';
import isUndefined from 'lodash/isUndefined';
import trim from 'lodash/trim';

import injectSaga from '../../../utils/injectSaga';
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
class Login extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    onLoginRequest: func.isRequired,
    isAuthenticated: PropTypes.bool,
    isAuthenticating: PropTypes.bool,
    errorMsg: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      submitted: false,
    };

    this.changeUsername = e => this._changeUsername(e.target.value);
    this.changePassword = e => this._changePassword(e.target.value);
    this.login = e => this._login();
  }

  _changeUsername(value) {
    this.setState({
      username: value,
    });
  }
  _changePassword(value) {
    this.setState({
      password: value,
    });
  }

  async _login() {
    const { username, password } = this.state;

    this.setState({
      submitted: true,
    });

    if (!isStringSafe(username) || !isStringSafe(password)) {
      this.props.loginFailure({ errorMsg: ALL_ARE_REQUIRED });
      return;
    }

    this.props.onLoginRequest({
      username,
      password,
      push: this.props.history.push,
    });
  }

  render() {
    const {
      intl,
      isAuthenticated,
      isAuthenticating,
      errorMsg,
      isWebServerConnected,
    } = this.props;
    const { username, password, errorMessage, submitted } = this.state;

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
                    onChange={this.changeUsername}
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
                    onChange={this.changePassword}
                    name="password"
                    className="input-text password"
                  />
                </InputTextWrapper>
                <SubmitButton onClick={this.login}>
                  <FormattedMessage {...messages.submit} />
                </SubmitButton>
              </form>
              <BottomPrompt>
                <FormattedMessage {...messages.registerPrompt} />
                &nbsp;<Link to="/signup">
                <FormattedMessage {...messages.signUp} />
              </Link>
              </BottomPrompt>
            </LoginPanel>
          </LoginBox>

        </LoginBoxContainer>
      </CentralContainer>
    );
  }
}

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

const withConnect = connect(mapStateToProps, mapDispatchToProps);
const withSaga = injectSaga({ key: 'login', saga });

export default compose(withConnect, withSaga)(injectIntl(Login));
