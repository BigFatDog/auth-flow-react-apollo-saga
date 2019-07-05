import React from 'react';
import Loading from '../../components/Loading';
import { Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';

import {
  makeSelectIsAuthenticated,
  makeSelectIsAuthenticating,
} from './selector';

const SecuredRoute = ({
  component: Component,
  layout: Layout,
  isAuthenticated,
  isAuthenticating,
  location,
  ...rest
}) => (
  <Route
    {...rest}
    render={props =>
      isAuthenticated === true ? (
        <Layout>
          <Component {...props} />
        </Layout>
      ) : isAuthenticating === false ? (
        <Redirect
          to={{
            pathname: '/login',
            state: { from: location },
          }}
        />
      ) : (
        <Loading />
      )
    }
  />
);

const mapStateToProps = createStructuredSelector({
  isAuthenticated: makeSelectIsAuthenticated(),
  isAuthenticating: makeSelectIsAuthenticating(),
});

const withConnect = connect(
  mapStateToProps,
  null
);

export default compose(withConnect)(SecuredRoute);
