import React from 'react';
import Loading from '../../components/Loading';
import { Route, Redirect } from 'react-router-dom';

const SecuredRoute = ({
  component: Component,
  isAuthenticated,
  isAuthenticating,
  ...rest
}) => (
  <Route
    {...rest}
    render={props =>
      isAuthenticated === true ? (
        <Component {...props} />
      ) : isAuthenticating === false ? (
        <Redirect
          to={{
            pathname: '/login',
            state: { from: props.location },
          }}
        />
      ) : (
        <Loading />
      )
    }
  />
);

export default SecuredRoute;
