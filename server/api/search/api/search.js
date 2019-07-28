import { normalizePrefix, toFullPrefix } from '../utils/prefixUtils';
import createPrefixModel from '../model/Prefix';
import _ from 'lodash';

import { BASE_DOC_NAME } from '../constants';

const formatCompletionsWithScores = completions =>
  _.chunk(completions, 2).map(completion => ({
    completion: completion[0],
    score: completion[1],
  }));

const syncRedisWithMongo = async (redisClient, prefix) => {
  const prefixModel = createPrefixModel(BASE_DOC_NAME);
  const singleModel = await prefixModel.findOne({ prefix });
  const completions =
    singleModel && singleModel.completions ? singleModel.completions : [];

  const commands = [];
  for (var i = 0; i < completions.length; i += 2) {
    // add mongo data to redis
    commands.push(['zadd', prefix, completions[i + 1], completions[i]]);
  }

  return redisClient.batch(commands).execAsync();
};

const getPersonalizedRes = async (redisClient, prefix, token) => {
  if (!token) {
    return [];
  }
  const prefixWithTenant = toFullPrefix(prefix, token);

  const personalizedResult = await redisClient.zrangeAsync(
    prefixWithTenant,
    0,
    1,
    'WITHSCORES'
  );

  return formatCompletionsWithScores(personalizedResult).map(d => {
    d.type = 'personalized';
    return d;
  });
};

const apiSearch = instance => async ({
  token = null,
  limit = 10,
  prefixQuery,
}) => {
  const {
    redisClient,
    config: { prefixMaxChars },
  } = instance;
  const prefix = normalizePrefix(prefixMaxChars, prefixQuery);

  const formattedPersonal = await getPersonalizedRes(
    redisClient,
    prefix,
    token
  );

  const args = [prefix, 0, limit - 1, 'WITHSCORES'];
  let commonResult = await redisClient.zrangeAsync(...args);

  if (commonResult.length === 0) {
    await syncRedisWithMongo(redisClient, prefix);
    const newRes = await redisClient.zrangeAsync(...args);
    return newRes.map(d => {
      d.type = 'base';
      return d;
    });
  } else {
    const flattedPersonal = formattedPersonal.map(d => d.completion);
    const formattedBase = formatCompletionsWithScores(commonResult)
      .map(d => {
        d.type = 'base';
        return d;
      })
      .filter(d => !flattedPersonal.includes(d.completion));
    // in case of cache miss, personalized result may still exists
    return [...formattedPersonal, ...formattedBase];
  }
};

export default apiSearch;
