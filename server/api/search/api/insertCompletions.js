import {
  extractPrefixes,
  normalizeCompletion,
  toFullPrefix,
  validateInputIsArray,
} from '../utils/prefixUtils';
import { persistPrefixes, getCompletionsCount } from '../utils/redisUtils';

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

export default apiInsertCompletions;
