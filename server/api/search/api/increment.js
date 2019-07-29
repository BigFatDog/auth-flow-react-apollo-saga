import {
  extractPrefixes,
  normalizeCompletion,
  toFullPrefix,
} from '../utils/prefixUtils';
import { persistPrefixes } from '../utils/redisUtils';

/**
 * both base data and personalized data are affected
 *
 * @param instance
 * @returns {function({completion?: *, token?: *}): *}
 */
const apiIncrement = instance => async ({ completion, token }) => {
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

  const increaseInRedis = async key => {
    const count = await redisClient.zcountAsync(key, '-inf', '+inf');
    const includesCompletion = await redisClient.zscoreAsync(
      key,
      normalizedCompletions
    );

    if (count >= bucketLimit && includesCompletion < 0) {
      // Replace lowest score completion with the current completion, using the lowest score incremented by 1
      const lastPosition = bucketLimit - 1;
      const lastElement = await redisClient.zrangeAsync(
        key,
        lastPosition,
        lastPosition,
        'WITHSCORES'
      );
      const newScore = lastElement[1] - 1;
      commands.push(['zremrangebyrank', key, lastPosition, -1]);
      commands.push(['zadd', key, newScore, normalizedCompletions]);
    } else {
      commands.push(['zincrby', key, -1, normalizedCompletions]);
    }
  };

  for (const d of prefixes) {
    await increaseInRedis(d);
    if (token) await increaseInRedis(toFullPrefix(d, token));
  }

  return redisClient
    .batch(commands)
    .execAsync()
    .then(async () => {
      await persistPrefixes(redisClient, prefixes, token);
      return 'persist success';
    });
};

export default apiIncrement;
