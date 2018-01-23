/**
 *
 * App
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 */
import React from 'react';
import { Switch, Route } from 'react-router-dom';

import NotFoundPage from './containers/NotFoundPage';
import Layout from './containers/Layout';
import EmptyLayout from './containers/Layout/EmptyLayout';

import RequireAuth from './core/auth/AuthComp';

import Login from './containers/Auth/Login';
import SignUp from './containers/Auth/SignUp';

import PostPage from './pages/posts';
import WelcomePage from './pages/welcome';

const MasterLayout = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={matchProps => (
        <Layout>
          <Component {...matchProps} />
        </Layout>
      )}
    />
  );
};

const EmptyLayoutRoute = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={matchProps => (
        <EmptyLayout>
          <Component {...matchProps} />
        </EmptyLayout>
      )}
    />
  );
};

export default function Routes() {
  return (
    <Switch>
      <MasterLayout exact path="/" component={RequireAuth(WelcomePage)} />
      <MasterLayout path="/post" component={RequireAuth(PostPage)} />
      <EmptyLayoutRoute path="/login" component={Login} />
      <EmptyLayoutRoute path="/signup" component={SignUp} />

      <MasterLayout path="" component={NotFoundPage} />
    </Switch>
  );
}
