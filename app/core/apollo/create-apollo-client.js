import { ApolloLink } from 'apollo-link';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import {
  errorLink,
  queryOrMutationLink,
  requestLink,
  subscriptionLink,
} from './links';

const createClient = dispatch => {
  const cache = new InMemoryCache();

  const client = new ApolloClient({
    ssrMode: false,
    ssrForceFetchDelay: 100,
    link: ApolloLink.from([
      errorLink(dispatch),
      requestLink({
        queryOrMutationLink: queryOrMutationLink(),
        subscriptionLink: subscriptionLink(),
      }),
    ]),
    cache,
    connectToDevTools: true,
    queryDeduplication: true,
  });

  // here we're initializing the cache with the data from the server's cache
  if (window.__APOLLO_STATE__) {
    cache.restore(window.__APOLLO_STATE__);
  }

  return client;
};

export default createClient;
