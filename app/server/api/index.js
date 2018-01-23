import { addErrorLoggingToSchema, makeExecutableSchema } from 'graphql-tools';
import merge from 'lodash/merge';
import logger from '../logger';
import pubsub from './pubsub';

import Posts from './posts';

const ApiList = [Posts];

const apiSchema = makeExecutableSchema({
  typeDefs: ApiList.map(d => d.typeDefs),
  resolvers: merge({}, ...ApiList.map(d => d.createResolvers(pubsub))),
  resolverValidationOptions: { requireResolversForAllFields: false },
});

addErrorLoggingToSchema(apiSchema, { log: e => logger.error(e) });

export default apiSchema;
