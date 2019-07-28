import {
  extractPrefixes,
  normalizeCompletion,
  toFullPrefix,
  validateInputIsArray,
} from '../utils/prefixUtils';
import { persistPrefixes } from '../utils/redisUtils';
import { BASE_DOC_NAME } from '../constants';

const apiDeleteCompletions = instance => async (completions, token) => {
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
      commands.push(['zrem', BASE_DOC_NAME, normalized]);
      commands.push(['zrem', toFullPrefix(prefix, token), normalized]);
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
