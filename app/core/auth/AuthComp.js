import React from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import {
  makeSelectUserId,
  makeSelectUserName,
  makeSelectIsAuthenticated,
  makeSelectIsAuthenticating,
} from './selector';

import saga from './saga';
import injectSaga from '../../utils/injectSaga';
import Loading from '../../components/Loading';

export default function requireAuthentication(Component) {
  class AuthenticatedComponent extends React.Component {
    componentWillMount() {
      this.checkAuth();
    }

    componentWillReceiveProps() {
      this.checkAuth();
    }

    checkAuth() {
      if (localStorage.getItem('token') === null || localStorage.getItem('refreshToken') === null ) {
        this.props.dispatch(push(`/login`));
      } else {
        if (
          this.props.isAuthenticating === false &&
          this.props.isAuthenticated === false
        ) {
          this.props.dispatch(push(`/login`));
        }
      }
    }

    render() {
      return (
        <div>
          {this.props.isAuthenticating === true ? (
            <Loading />
          ) : (
            <Component {...this.props} />
          )}
        </div>
      );
    }
  }

  const mapStateToProps = createStructuredSelector({
    userName: makeSelectUserName(),
    userId: makeSelectUserId(),
    isAuthenticated: makeSelectIsAuthenticated(),
    isAuthenticating: makeSelectIsAuthenticating(),
  });

  const withConnect = connect(mapStateToProps, null);
  const withSaga = injectSaga({ key: 'verify', saga });
  return compose(withConnect, withSaga)(AuthenticatedComponent);
}
