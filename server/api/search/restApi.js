import _ from 'lodash';

const formatCompletionsWithScores = completions =>
  _.chunk(completions, 2).map(completion => ({
    completion: completion[0],
    score: completion[1],
  }));

const getCompletions = instance => async (req, res, next) => {
  const {
    user: { _id },
    query: { prefix, limit, scores },
  } = req;
  const opts = {
    limit: limit || instance.config.suggestionCount,
    withScores: scores === 'true' || false,
  };
  let completions;

  try {
    completions = await instance.search(prefix, _id, opts);
  } catch (error) {
    return next(error);
  }

  if (opts.withScores) {
    completions = formatCompletionsWithScores(completions);
  }

  res.status(200).json(completions);
};

const saveCompletions = instance => (req, res, next) => {
  const {
    user: { _id },
    body: { completions },
  } = req;
  instance.insertCompletions(completions, _id);
  res.sendStatus(202);
};

const deleteCompletions = instance => (req, res, next) => {
  const {
    user: { _id },
    body: { completions },
  } = req;

  instance.deleteCompletions(completions, _id);

  res.sendStatus(202);
};

const incrementCompletion = instance => async (req, res, next) => {
  const {
    user: { _id },
    body: { completion },
  } = req;

  try {
    await instance.increment(completion, _id);
  } catch (error) {
    return next(error);
  }

  res.sendStatus(204);
};

const dumpCompletions = instance => async (req, res, next) => {
  const {
    user: { _id },
  } = req;

  try {
    const data = await import('./sample.json');
    await instance.insertCompletions(data.default, _id);
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
  dumpCompletions,
};
