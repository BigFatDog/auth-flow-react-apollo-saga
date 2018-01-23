import { Engine } from 'apollo-engine';

import settings from '../../../setting.json';

const apolloEngineBeforeware = () => {
  const engine = new Engine({
    engineConfig: {
      apiKey: settings.apolloEngineKey,
      logging: {
        level: 'ERROR',
      },
    },
    origins: [
      {
        backend: {
          url: settings.graphqlUrl,
          supportsBatch: true,
        },
      },
    ],
    graphqlPort: 3010,
    endpoint: '/graphql',
    dumpTraffic: true,
  });

  engine.start();

  return engine.expressMiddleware();
};

export default apolloEngineBeforeware;
