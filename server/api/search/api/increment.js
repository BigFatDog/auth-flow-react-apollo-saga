import {
  extractPrefixes,
  normalizeCompletion,
  toFullPrefix,
} from '../utils/prefixUtils';
import { persistPrefixes, getCompletionsCount } from '../utils/redisUtils';
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

export default apiIncrement;
