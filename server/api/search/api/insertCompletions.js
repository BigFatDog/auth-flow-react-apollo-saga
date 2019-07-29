import {
  extractPrefixes,
  normalizeCompletion,
  validateInputIsArray,
} from '../utils/prefixUtils';
import { persistPrefixes } from '../utils/redisUtils';

const apiInsertCompletions = instance => async array => {
  validateInputIsArray(array, 'insertCompletions');

  const {
    redisClient,
    config: { completionMaxChars, prefixMaxChars, prefixMinChars, bucketLimit },
  } = instance;

  let allPrefixes = [];

  for (let i = 0; i < array.length; i++) {
    const completion = normalizeCompletion(completionMaxChars, array[i]);
    const prefixes = extractPrefixes(
      prefixMaxChars,
      prefixMinChars,
      completion
    );

    allPrefixes = [...allPrefixes, ...prefixes];

    for (const d of prefixes) {
      const count = await redisClient.zcountAsync(d, '-inf', '+inf');

      if (count < bucketLimit) {
        await redisClient.zaddAsync(d, 'NX', 0, completion);
      }
    }
  }

  return persistPrefixes(redisClient, allPrefixes);
};

export default apiInsertCompletions;
