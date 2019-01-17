import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import 'isomorphic-fetch';
import settings from '../../../setting.json';
import schema from '../api';

const graphqlMiddleware = () =>
  graphqlExpress(req => ({
    schema,
    debug: true,
    context: {
      user: req.user,
    },
    formatError: error => ({
      message: error.message,
      locations: error.locations,
      stack: error.stack,
      path: error.path,
    }),
    tracing: true,
    cacheControl: true,
  }));

const graphiqlMiddleware = () =>
  graphiqlExpress({
    endpointURL: '/graphql',
    subscriptionsEndpoint: settings.wsURI,
  });

export { graphqlMiddleware, graphiqlMiddleware };
