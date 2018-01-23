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

import { signUpRequest, signUpFailure } from '../../../core/auth/actions';

import messages from '../messages';
import {
  ALL_ARE_REQUIRED,
  EMAIL_IS_INVALID,
} from '../../../core/auth/messages';

import {
  makeSelectIsAuthenticated,
  makeSelectIsAuthenticating,
  makeSelectMessage,
} from '../../../core/auth/selector';

import {
  makeSelectWebServerConnected,
  makeSelectMongodbConnected,
} from '../../../core/system/selector';

import validateEmail from './validate-email';

import CentralContainer from '../../../components/Auth/CentralContainer';
import ErrorBox from '../../../components/Auth/ErrorBox';
import InputTextWrapper from '../../../components/Auth/InputTextWrapper';
import LoginBox from '../../../components/Auth/LoginBox';
import LoginBoxContainer from '../../../components/Auth/LoginBoxContainer';
import LoginPanel from '../../../components/Auth/LoginPanel';
import SubmitButton from '../../../components/Auth/SubmitButton';
import BottomPrompt from '../../../components/Auth/BottomPrompt';

import getAuthError from '../get-auth-error';

const isStringSafe = str =>
  !isNull(str) && !isUndefined(str) && !isEmpty(trim(str));

class SignUp extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    onSignUpRequest: func.isRequired,
    onSignUpFailure: func.isRequired,
    isAuthenticated: PropTypes.bool,
    isAuthenticating: PropTypes.bool,
    errorMsg: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      email: '',
      submitted: false,
    };

    this.changeUsername = e => this._changeUsername(e.target.value);
    this.changePassword = e => this._changePassword(e.target.value);
    this.changeEmail = e => this._changeEmail(e.target.value);
    this.signUp = e => this._signUp(e);
  }

  _changeEmail(value) {
    this.setState({
      email: value,
    });
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

  async _signUp() {
    const { email, username, password } = this.state;

    this.setState({
      submitted: true,
    });

    if (
      !isStringSafe(email) ||
      !isStringSafe(username) ||
      !isStringSafe(password)
    ) {
      this.props.onSignUpFailure({ errorMsg: ALL_ARE_REQUIRED });
      return;
    }

    if (!validateEmail(email)) {
      this.props.onSignUpFailure({ errorMsg: EMAIL_IS_INVALID });
      return;
    }

    this.props.onSignUpRequest({
      email,
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
    const { submitted } = this.state;

    const emailPlaceholder = intl.formatMessage({ id: messages.email.id });
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
              <form autoComplete={'off'}>
                <InputTextWrapper>
                  <i className="fas fa-at input-icon" />
                  <input
                    type="text"
                    placeholder={emailPlaceholder}
                    onChange={this.changeEmail}
                    name="username"
                    className="input-text username"
                    required
                  />
                </InputTextWrapper>
                <InputTextWrapper>
                  <i className="fas fa-user input-icon" />
                  <input
                    type="text"
                    placeholder={namePlaceholder}
                    onChange={this.changeUsername}
                    name="username"
                    className="input-text username"
                    required
                  />
                </InputTextWrapper>
                <InputTextWrapper>
                  <i className="fas fa-lock input-icon" />
                  <input
                    type="password"
                    placeholder={passwordPlaceholder}
                    onChange={this.changePassword}
                    name="password"
                    className="input-text password"
                    required
                  />
                </InputTextWrapper>
                <SubmitButton disabled={true} onClick={this.signUp}>
                  <FormattedMessage {...messages.signUp} />
                </SubmitButton>
              </form>
              <BottomPrompt>
                <FormattedMessage {...messages.signUpHaveAccount} />
                &nbsp;<Link to={'/login'}>
                <FormattedMessage {...messages.signIn} />
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
    onSignUpRequest: payload => dispatch(signUpRequest(payload)),
    onSignUpFailure: payload => dispatch(signUpFailure(payload)),
  };
};

const withConnect = connect(mapStateToProps, mapDispatchToProps);
const withSaga = injectSaga({ key: 'signUp', saga });

export default compose(withConnect, withSaga)(injectIntl(SignUp));
