import { wrapPubSub } from 'apollo-logger';
import { PubSub } from 'graphql-subscriptions';

import settings from '../../setting.json';

const pubsub = settings.apolloLogging
  ? wrapPubSub(new PubSub(), { logger: console.log })
  : new PubSub();

export default pubsub;
