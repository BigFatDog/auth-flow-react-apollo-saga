import mongoose from 'mongoose';
import chalk from 'chalk';
import Settings from '../../setting.json';
import logger from '../logger';

export default app => {
  mongoose.Promise = global.Promise;

  const db = mongoose.connection;

  db.on('error', function(error) {
    console.error('Error in MongoDb connection: ' + error);
    mongoose.disconnect();
  });
  db.on('connected', function() {
    console.log('MongoDB connected!');
  });
  db.once('open', function() {
    logger.info('Connected to mongoose', chalk.green('✓'));
  });
  db.on('reconnected', function() {
    console.log('MongoDB reconnected!');
  });
  db.on('disconnected', function() {
    console.log('MongoDB disconnected!');
    mongoose.connect(Settings.mongoUrl, {
      auto_reconnect: true,
      useNewUrlParser: true,
    });
  });

  mongoose.connect(Settings.mongoUrl, {
    auto_reconnect: true,
    useNewUrlParser: true,
  });
};
