const validateInputIsArray = (input, funcName) => {
  if (!Array.isArray(input)) {
    throw new TypeError(`The argument to ${funcName} must be an array`);
  }
};

// remove instances of more than one whitespace
const normalizeCompletion = (completionMaxChars, originalCompletions) =>
  originalCompletions
    .slice(0, completionMaxChars)
    .toLowerCase()
    .trim()
    .replace(/\s{2,}/g, ' ');

// remove instances of more than one whitespace
const normalizePrefix = (prefixMaxChars, originalQuery) =>
  originalQuery
    .slice(0, prefixMaxChars)
    .toLowerCase()
    .replace(/\s{2,}/g, ' ');

const extractPrefixes = (prefixMaxChars, prefixMinChars, completion) => {
  const normalized = normalizePrefix(prefixMaxChars, completion);

  const prefixes = [];
  for (let i = prefixMinChars; i <= normalized.length; i++) {
    prefixes.push(normalized.slice(0, i));
  }
  return prefixes;
};

const toFullPrefix = (prefix, token) => `${token}:${prefix}`;

export {
  validateInputIsArray,
  normalizeCompletion,
  normalizePrefix,
  extractPrefixes,
  toFullPrefix,
};
