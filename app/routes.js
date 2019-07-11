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

import SecuredRoute from './core/auth/SecuredRoute';

import Login from './containers/Auth/Login';
import SignUp from './containers/Auth/SignUp';

import PostPage from './pages/posts';
import WelcomePage from './pages/welcome';
import LineChart from './containers/Realtime';
import Vartan from './containers/Vartan';

const MasterLayout = ({ component: Component, secured = false, ...rest }) =>
  secured === true ? (
    <SecuredRoute {...rest} component={Component} layout={Layout} />
  ) : (
    <Route
      {...rest}
      render={matchProps => (
        <Layout>
          <Component {...matchProps} />
        </Layout>
      )}
    />
  );

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
      <MasterLayout exact path="/" component={WelcomePage} secured={true} />
      <MasterLayout path="/post" component={PostPage} secured={true} />
      <MasterLayout path="/realtime" component={LineChart} />
      <MasterLayout path="/gl" component={Vartan} />
      <EmptyLayoutRoute path="/login" component={Login} />
      <EmptyLayoutRoute path="/signup" component={SignUp} />

      <MasterLayout path="" component={NotFoundPage} />
    </Switch>
  );
}
