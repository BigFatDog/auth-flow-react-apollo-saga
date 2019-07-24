import createPrefixModel from '../model/Prefix';
import { toFullPrefix } from './prefixUtils';

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

export { persistPrefixes, syncRedisWithMongo, getCompletionsCount };
