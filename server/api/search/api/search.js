import { normalizePrefix, toFullPrefix } from '../utils/prefixUtils';
import { syncRedisWithMongo } from '../utils/redisUtils';

const apiSearch = instance => async (prefixQuery, token, opts = {}) => {
  const {
    redisClient,
    config: { suggestionCount, prefixMaxChars },
  } = instance;
  const prefix = normalizePrefix(prefixMaxChars, prefixQuery);
  const prefixWithTenant = toFullPrefix(prefix, token);

  const limit = opts.limit || suggestionCount;
  const args = [prefixWithTenant, 0, limit - 1, 'WITHSCORES'];
  const result = await redisClient.zrangeAsync(...args);

  if (result.length === 0) {
    await syncRedisWithMongo(redisClient, prefix, token);
    return await redisClient.zrangeAsync(...args);
  } else {
    return result;
  }
};

export default apiSearch;
