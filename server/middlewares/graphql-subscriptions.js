import { SubscriptionServer } from 'subscriptions-transport-ws';
import { execute, subscribe } from 'graphql';
import { createServer } from 'http';

import schema from '../api';
import logger from '../logger';
import settings from '../../setting.json';

let subscriptionServer;

const WS_PORT = settings.wsPort;

const addSubscriptions = httpServer => {
  // Create WebSocket listener server
  const websocketServer = createServer(httpServer);

  // Bind it to port and start listening
  websocketServer.listen(WS_PORT, () =>
    logger.info(`Websocket Server is now running on ws://localhost:${WS_PORT}`)
  );

  subscriptionServer = SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
      onConnect(connectionParams, webSocket) {
        const userPromise = new Promise((res, rej) => {
          if (connectionParams.jwt) {
            jsonwebtoken.verify(
              connectionParams.jwt,
              JWT_SECRET,
              (err, decoded) => {
                if (err) {
                  rej('Invalid Token');
                }

                res(
                  User.findOne({
                    where: { id: decoded.id, version: decoded.version },
                  })
                );
              }
            );
          } else {
            rej('No Token');
          }
        });

        return userPromise.then(user => {
          if (user) {
            return { user: Promise.resolve(user) };
          }

          return Promise.reject('No User');
        });
      },
    },
    {
      server: websocketServer,
      path: '/graphql',
    }
  );
};

const addGraphQLSubscriptions = httpServer => {
  if (module.hot && module.hot.data) {
    const prevServer = module.hot.data.subscriptionServer;
    if (prevServer && prevServer.wsServer) {
      logger.debug('Reloading the subscription server.');
      prevServer.wsServer.close(() => {
        addSubscriptions(httpServer);
      });
    }
  } else {
    addSubscriptions(httpServer);
  }
};

if (module.hot) {
  module.hot.dispose(data => {
    try {
      data.subscriptionServer = subscriptionServer;
    } catch (error) {
      logger.error(error.stack);
    }
  });
}

export default addGraphQLSubscriptions;
