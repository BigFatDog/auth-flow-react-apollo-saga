import { ApolloLink } from 'apollo-link';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { LoggingLink } from 'apollo-logger';
import { createApolloFetch } from 'apollo-fetch';
// import { BatchHttpLink } from 'apollo-link-batch-http';
import { SchemaLink } from 'apollo-link-schema';

import schema from '../../server/api';

import settings from '../../../setting.json';

const createApolloClient = (req, res) => {
  const fetch = createApolloFetch({ uri: settings.graphqlUrl });
  fetch.batchUse(({ options }, next) => {
    options.credentials = 'same-origin';
    options.headers = req.headers;

    next();
  });

  const cache = new InMemoryCache();
  // const links = new BatchHttpLink({ fetch });
  const links = new SchemaLink({ schema });
  const client = new ApolloClient({
    link: ApolloLink.from(
      (settings.logging.apolloLogging ? [new LoggingLink()] : []).concat([
        links,
      ])
    ),
    cache,
    ssrMode: true,
  });

  return { client, cache };
};

export default createApolloClient;
