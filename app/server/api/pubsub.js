import { addApolloLogging } from 'apollo-logger';
import { PubSub } from 'graphql-subscriptions';

import settings from '../../../setting.json';

const pubsub = settings.apolloLogging
  ? addApolloLogging(new PubSub())
  : new PubSub();

export default pubsub;
