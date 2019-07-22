import SearchCache from './SearchCahce';
import _ from 'lodash';

const formatCompletionsWithScores = completions => {
  return _.chunk(completions, 2).map(completion => ({
    completion: completion[0],
    score: completion[1],
  }));
};

const getCompletions = async (req, res, next) => {
  const {
    user: { _id },
    query: { prefix, limit, scores },
  } = req;
  const opts = {
    limit: limit || SearchCache.suggestionCount,
    withScores: scores || false,
  };
  let completions;

  try {
    completions = await SearchCache.search(prefix, _id, opts);
  } catch (error) {
    return next(error);
  }

  if (opts.withScores) {
    completions = formatCompletionsWithScores(completions);
  }

  res.status(200).json(completions);
};

const saveCompletions = (req, res, next) => {
  const {
    body: { completions, userId },
  } = req;
  SearchCache.invoke(() => SearchCache.insertCompletions(completions, userId));
  res.sendStatus(202);
};

const deleteCompletions = (req, res, next) => {
  const {
    body: { completions, userId },
  } = req;

  SearchCache.invoke(() => SearchCache.deleteCompletions(completions, userId));

  res.sendStatus(202);
};

const incrementCompletion = async function(req, res, next) {
  const {
    body: { completion, userId },
  } = req;

  try {
    await SearchCache.invoke(() => SearchCache.increment(completion, userId));
  } catch (error) {
    return next(error);
  }

  res.sendStatus(204);
};

const dumpCompletions = async function(req, res, next) {
  const {
    user: { _id },
  } = req;

  try {
    const data = await import('./sample.json');
    await SearchCache.insertCompletions(data.default, _id);
  } catch (error) {
    return next(error);
  }

  res.sendStatus(204);
};

export {
  getCompletions,
  saveCompletions,
  deleteCompletions,
  incrementCompletion,
  dumpCompletions
};
