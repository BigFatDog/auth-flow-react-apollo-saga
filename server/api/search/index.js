import apiDeleteCompletions from './api/deleteCompletions';
import dumpFile from './api/dumpFile';
import apiIncrement from './api/increment';
import apiInsertCompletions from './api/insertCompletions';
import apiSearch from './api/search';

const DefaultConfig = {
  maxMemory: 500,
  suggestionCount: 10,
  prefixMinChars: 1,
  prefixMaxChars: 15,
  completionMaxChars: 50,
  bucketLimit: 50,
};

const init = (redisClient, config = DefaultConfig) => {
  const initConfig = {
    redisClient,
    config,
  };

  return Object.assign(
    {},
    initConfig,
    { insertCompletions: apiInsertCompletions(initConfig) },
    {
      deleteCompletions: apiDeleteCompletions(initConfig),
    },
    { search: apiSearch(initConfig) },
    { increment: apiIncrement(initConfig) },
    { dumpFile: dumpFile(initConfig) }
  );
};

export default init;
