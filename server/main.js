import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import ngrokTunnel from 'ngrok';
import logger from './logger';
import argv from './argv';
import port from './port';
import redis from 'redis';
import bluebird from 'bluebird';
import setting from '../setting.json';

import tokenMiddleware from './middlewares/token-middleware';
import graphqlMiddleware from './middlewares/graphql';

import login from './api/auth/login';
import register from './api/auth/register';
import logout from './api/auth/logout';
import verifyToken from './api/auth/verify';
import {
  getCompletions,
  saveCompletions,
  deleteCompletions,
  incrementCompletion,
  dumpCompletions,
} from './api/search/restApi';
import initSearcher from './api/search';

import addGraphQLSubscriptions from './middlewares/graphql-subscriptions';
import startMongo from './database/mongo';

import websiteProdMiddleware from './middlewares/website-prod';

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const isDev = process.env.NODE_ENV !== 'production';
const ngrok =
  (isDev && process.env.ENABLE_TUNNEL) || argv.tunnel ? ngrokTunnel : false;

const redisClient = redis.createClient({
  url: setting.redisUrl,
  retry_strategy: function(options) {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      // End reconnecting on a specific error and flush all commands with
      // a individual error
      return new Error('The server refused the connection');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      // End reconnecting after a specific timeout and flush all commands
      // with a individual error
      return new Error('Retry time exhausted');
    }
    if (options.attempt > 10) {
      // End reconnecting with built in error
      return undefined;
    }
    // reconnect after
    return Math.min(options.attempt * 100, 3000);
  },
});
const searcher = initSearcher(redisClient);

const app = express();

// node api
app.enable('trust proxy');
app.use(cors({ credentials: true }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

startMongo(app);

// middlewares
app.use('/graphql', tokenMiddleware(setting.SECRET));
graphqlMiddleware(app);
addGraphQLSubscriptions(app);

if (isDev) {
  import('./middlewares/website-dev').then(websiteDevMiddleware => {
    websiteDevMiddleware.default(app);
  });
} else {
  websiteProdMiddleware(app);
}

app.post('/login', login(setting.SECRET));
app.post('/verifyToken', verifyToken(setting.SECRET));
app.post('/signup', register(setting.SECRET));
app.post('/logout', logout);
app.use('/', express.static('public', { etag: false }));

app.use('/api', tokenMiddleware(setting.SECRET));

app.get('/api/completions/get', getCompletions(searcher));
app.get('/api/completions/dump', dumpCompletions(searcher));
app.post('/api/completions/save', saveCompletions(searcher));
app.post('/api/completions/delete', deleteCompletions(searcher));
app.post('/api/completion/increment', incrementCompletion(searcher));

// get the intended host and port number, use localhost and port 3000 if not provided
const customHost = argv.host || process.env.HOST;
const host = customHost || null; // Let http.Server use its default IPv6/4 host
const prettyHost = customHost || 'localhost';

// Start your app.
app.listen(port, host, err => {
  if (err) {
    return logger.error(err.message);
  }

  // Connect to ngrok in dev mode
  if (ngrok) {
    ngrok.connect(port, (innerErr, url) => {
      if (innerErr) {
        return logger.error(innerErr);
      }

      logger.appStarted(port, prettyHost, url);
    });
  } else {
    logger.appStarted(port, prettyHost);
  }
});

process.on('unhandledRejection', error => {
  console.error('unhandledRejection', error);
});

if (module.hot) {
  module.hot.dispose(() => {
    try {
      app.close();
    } catch (error) {
      logger.error(error.stack);
    }
  });
  module.hot.accept(['./middlewares/website-dev', './middlewares/graphql']);
  module.hot.accept(['./middlewares/graphql-subscriptions'], () => {
    try {
      addGraphQLSubscriptions(app);
    } catch (error) {
      logger.error(error.stack);
    }
  });

  module.hot.accept();
}

export {};
