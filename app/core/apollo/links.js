import { ApolloLink } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { onError } from 'apollo-link-error';
import { getMainDefinition } from 'apollo-utilities';
import { setContext } from 'apollo-link-context';
import { push } from 'connected-react-router';

import Setting from '../../../setting.json';

/**
 * deprecated in favour of cookie approach
 *
 * @type {ApolloLink}
 */
export const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : null,
    },
  };
});

export const errorLink = dispatch =>
  onError(({ graphQLErrors, networkError }) => {
    /*
  onError receives a callback in the event a GraphQL or network error occurs.
  This example is a bit contrived, but in the real world, you could connect
  a logging service to the errorLink or perform a specific action in response
  to an error.
  */
    if (graphQLErrors) {
      graphQLErrors.map(({ message, location, path }) =>
        console.log(
          `[GraphQL error]: Message: ${message}, Location: ${location}, Path: ${path}`
        )
      );
    }
    if (networkError) {
      if (networkError.statusCode === 401) {
        dispatch(push('/login'));
      }
      console.log(`[Network error]: ${networkError.bodyText}`);
    }
  });

export const subscriptionLink = (config = {}) =>
  new WebSocketLink({
    uri: Setting.wsURI,
    options: { reconnect: true },
    connectionParams() {
      return { jwt: localStorage.getItem('token') };
    },
    ...config,
  });

export const queryOrMutationLink = (config = {}) =>
  new ApolloLink((operation, forward) => {
    /*
    You can use a simple middleware link like this one to set credentials,
    headers, or whatever else you need on the context.
    All links in the chain will have access to the context.
    */
    operation.setContext({
      credentials: 'same-origin',
    });

    return forward(operation);
  }).concat(
    new HttpLink({
      ...config,
    })
  );

export const requestLink = ({ queryOrMutationLink, subscriptionLink }) =>
  /*
    This link checks if the operation is a subscription.
    If it is, we use our subscription link to retrieve data over WebSockets.
    If it is a query or mutation, we retrieve data over HTTP.
  */
  ApolloLink.split(
    ({ query }) => {
      const { kind, operation } = getMainDefinition(query);
      return kind === 'OperationDefinition' && operation === 'subscription';
    },
    subscriptionLink,
    queryOrMutationLink
  );
