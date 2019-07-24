import {
  extractPrefixes,
  normalizeCompletion,
  toFullPrefix,
  validateInputIsArray,
} from '../utils/prefixUtils';
import { persistPrefixes } from '../utils/redisUtils';

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

export default apiDeleteCompletions;
