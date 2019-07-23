import { ApolloServer } from 'apollo-server-express';
import 'isomorphic-fetch';
import schema from '../api';

const server = new ApolloServer({
  ...schema,
  debug: true,
  context: ({ req }) => ({ user: req.user }),
  formatError: error => ({
    message: error.message,
    locations: error.locations,
    stack: error.stack,
    path: error.path,
  }),
  tracing: true,
  cacheControl: true,
  introspection: true,
  playground: true,
});

const graphqlMiddleware = app => server.applyMiddleware({ app });

export default graphqlMiddleware;
