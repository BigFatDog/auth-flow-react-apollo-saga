import { defineMessages } from 'react-intl';

export default defineMessages({
  title: {
    id: 'auth.login.title',
    defaultMessage: 'Auth Flow',
  },
  username: {
    id: 'auth.login.username',
    defaultMessage: 'username',
  },
  password: {
    id: 'auth.login.password',
    defaultMessage: 'password',
  },
  email: {
    id: 'auth.login.email',
    defaultMessage: 'email',
  },
  submit: {
    id: 'auth.login.submit',
    defaultMessage: 'login',
  },

  authenticating: {
    id: 'auth.login.authenticating',
    defaultMessage: 'authenticating...',
  },
  generalError: {
    id: 'auth.login.generalError',
    defaultMessage: 'Error Encountered During Login',
  },
  forgotPasswordPrompt: {
    id: 'auth.login.forgotPasswordPrompt',
    defaultMessage: "Don't remember your password?",
  },
  registerPrompt: {
    id: 'auth.login.registerPrompt',
    defaultMessage: 'Still no account? Please',
  },

  signUpAgree: {
    id: 'auth.signUp.agreement',
    defaultMessage: 'By signing up, you agree to our',
  },
  signUpTermOfService: {
    id: 'auth.signUp.termOfService',
    defaultMessage: 'terms of service',
  },
  signUpHaveAccount: {
    id: 'auth.signUp.haveAccount',
    defaultMessage: 'Have account already? Please go to',
  },
  signIn: {
    id: 'auth.common.signIn',
    defaultMessage: 'Sign In',
  },
  signUp: {
    id: 'auth.common.signUp',
    defaultMessage: 'Sign Up',
  },
});
