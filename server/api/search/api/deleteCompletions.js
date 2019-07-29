import {
  extractPrefixes,
  normalizeCompletion,
  toFullPrefix,
  validateInputIsArray,
} from '../utils/prefixUtils';
import { persistPrefix } from '../utils/redisUtils';

const removePersonalizedInMongo = async (redisClient, prefixes, token) => {
  for (let i = 0; i < prefixes.length; i++) {
    await persistPrefix(
      redisClient,
      prefixes[i],
      toFullPrefix(prefixes[i], token)
    );
  }
};

/**
 * only personalized data can be deleted
 *
 * @param instance
 * @returns {Function}
 */
const apiDeleteCompletions = instance => async ({ completions, token }) => {
  const {
    redisClient,
    config: { completionMaxChars, prefixMaxChars, prefixMinChars },
  } = instance;
  validateInputIsArray(completions, 'deleteCompletions');

  let allPrefixes = [];
  const commands = [];

  completions.forEach(completion => {
    const normalized = normalizeCompletion(completionMaxChars, completion);
    const prefixes = extractPrefixes(
      prefixMaxChars,
      prefixMinChars,
      normalized
    );
    allPrefixes = [...allPrefixes, ...prefixes];

    prefixes.forEach(prefix => {
      commands.push(['zrem', toFullPrefix(prefix, token), normalized]);
    });
  });

  await redisClient.batch(commands).execAsync();
  await removePersonalizedInMongo(redisClient, allPrefixes, token);
};

export default apiDeleteCompletions;
