import fs from 'fs';
import path from 'path';
import JSONStream from 'JSONStream';
import Writer from './Streamables';
import createPrefixModel from './model/Prefix';

import {
  validateInputIsArray,
  normalizeCompletion,
  normalizePrefix,
  extractPrefixes,
  toFullPrefix,
} from './utils';

const persistPrefixes = async (redisClient, prefixes, token) => {
  for (var i = 0; i < prefixes.length; i++) {
    const prefixWithTenant = toFullPrefix(prefix, token);
    const completions = await redisClient.zrangeAsync(
      prefixWithTenant,
      0,
      -1,
      'WITHSCORES'
    );

    const prefixModel = createPrefixModel(token);
    if (completions.length === 0) {
      await prefixModel.findOneAndDelete({ prefix });
    } else {
      await prefixModel.createIndexes({ prefix: 'text', background: true });
      await prefixModel.findOneAndUpdate(
        { prefix },
        { $set: { completions } },
        { new: true, upsert: true }
      );
    }
  }
};
const syncRedisWithMongo = async (redisClient, prefix, token) => {
  const prefixModel = createPrefixModel(token);
  const singleModel = await prefixModel.findOne({ prefix });
  const completions =
    singleModel && singleModel.completions ? singleModel.completions : [];

  const prefixWithTenant = toFullPrefix(prefix, token);

  const commands = [];
  for (var i = 0; i < completions.length; i += 2) {
    commands.push([
      'zadd',
      prefixWithTenant,
      completions[i + 1],
      completions[i],
    ]);
  }

  return redisClient.batch(commands).execAsync();
};

const getCompletionsCount = async (
  redisClient,
  prefix,
  tenant,
  prefixWithTenant
) => {
  const count = await redisClient.zcountAsync(prefixWithTenant, '-inf', '+inf');

  if (count === 0) {
    await syncRedisWithMongo(redisClient, prefix, tenant);
    return await redisClient.zcountAsync(prefixWithTenant, '-inf', '+inf');
  } else {
    return count;
  }
};

const apiIncrement = instance => async (completion, tenant) => {
  const {
    redisClient,
    config: { completionMaxChars, prefixMaxChars, prefixMinChars, bucketLimit },
  } = instance;
  const normalizedCompletions = normalizeCompletion(
    completionMaxChars,
    completion
  );
  const prefixes = extractPrefixes(
    prefixMaxChars,
    prefixMinChars,
    normalizedCompletions
  );
  const commands = [];

  for (let i = 0; i < prefixes.length; i++) {
    let prefixWithTenant = toFullPrefix(prefixes[i], tenant);
    let count = await getCompletionsCount(
      redisClient,
      prefixes[i],
      tenant,
      prefixWithTenant
    );
    const includesCompletion = await redisClient.zscoreAsync(
      prefixWithTenant,
      normalizedCompletions
    );

    if (count >= bucketLimit && includesCompletion < 0) {
      // Replace lowest score completion with the current completion, using the lowest score incremented by 1
      const lastPosition = bucketLimit - 1;
      const lastElement = await redisClient.zrangeAsync(
        prefixWithTenant,
        lastPosition,
        lastPosition,
        'WITHSCORES'
      );
      const newScore = lastElement[1] - 1;
      commands.push(['zremrangebyrank', prefixWithTenant, lastPosition, -1]);
      commands.push([
        'zadd',
        prefixWithTenant,
        newScore,
        normalizedCompletions,
      ]);
    } else {
      commands.push(['zincrby', prefixWithTenant, -1, normalizedCompletions]);
    }
  }

  return redisClient
    .batch(commands)
    .execAsync()
    .then(async () => {
      await persistPrefixes(redisClient, prefixes, tenant);
      return 'persist success';
    });
};

const apiSearch = instance => async (prefixQuery, token, opts = {}) => {
  const {
    redisClient,
    config: { suggestionCount, prefixMaxChars },
  } = instance;
  const prefix = normalizePrefix(prefixMaxChars, prefixQuery);
  const prefixWithTenant = toFullPrefix(prefix, token);

  const result = await redisClient.zrangeAsync(
    prefixWithTenant,
    0,
    suggestionCount - 1,
    'WITHSCORES'
  );

  if (result.length === 0) {
    await syncRedisWithMongo(redisClient, prefix, token);
    return await redisClient.zrangeAsync(...args);
  } else {
    return result;
  }
};

const apiDeleteCompletions = instance => async (completions, token) => {
  const {
    redisClient,
    config: { completionMaxChars, prefixMaxChars, prefixMinChars },
  } = instance;
  validateInputIsArray(completions, 'deleteCompletions');

  const allPrefixes = [];
  const commands = [];

  completions.forEach(completion => {
    const normalized = normalizeCompletion(completionMaxChars, completion);
    const prefixes = extractPrefixes(
      prefixMaxChars,
      prefixMinChars,
      normalized
    );
    allPrefixes.concat(prefixes);

    prefixes.forEach(prefix => {
      const prefixWithTenant = toFullPrefix(prefix, token);
      commands.push(['zrem', prefixWithTenant, normalized]);
    });
  });

  return redisClient
    .batch(commands)
    .execAsync()
    .then(async () => {
      await persistPrefixes(redisClient, allPrefixes, token);
      return 'persist success';
    });
};

const apiInsertCompletions = instance => async (array, token) => {
  validateInputIsArray(array, 'insertCompletions');

  const {
    redisClient,
    config: { completionMaxChars, prefixMaxChars, prefixMinChars, bucketLimit },
  } = instance;

  const allPrefixes = [];

  for (let i = 0; i < array.length; i++) {
    const completion = normalizeCompletion(completionMaxChars, array[i]);
    const prefixes = extractPrefixes(
      prefixMaxChars,
      prefixMinChars,
      completion
    );

    allPrefixes.concat(prefixes);

    for (const d of prefixes) {
      const prefixWithTenant = toFullPrefix(d, token);
      const count = await getCompletionsCount(
        redisClient,
        d,
        token,
        prefixWithTenant
      );

      if (count < bucketLimit) {
        await redisClient.zaddAsync(prefixWithTenant, 'NX', 0, completion);
      }
    }
  }

  return persistPrefixes(redisClient, allPrefixes, token);
};

const dumpFile = instance => (filePath, token) => {
  const json = fs.createReadStream(
    path.resolve(process.cwd(), filePath),
    'utf8'
  );
  const parser = JSONStream.parse('*');
  const writer = new Writer(apiInsertCompletions(instance), token);

  return new Promise((resolve, reject) => {
    json.pipe(parser).pipe(writer);
    writer.on('finish', () => resolve('Import finished'));
  });
};

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
