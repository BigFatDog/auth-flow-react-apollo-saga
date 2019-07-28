const getCompletions = instance => async (req, res, next) => {
  const {
    query: { prefix, limit, scores },
  } = req;

  let completions = [];

  try {
    completions = await instance.search({
      prefixQuery: prefix,
      token: req.user && req.user._id ? req.user._id : null,
      limit: limit || instance.config.suggestionCount,
      withScores: scores === 'true' || false,
    });
  } catch (error) {
    return next(error);
  }

  res.status(200).json(completions);
};

const saveCompletions = instance => (req, res, next) => {
  const {
    user: { _id },
    body: { completions },
  } = req;
  instance.insertCompletions(completions, _id);
  res.sendStatus(200);
};

const deleteCompletions = instance => (req, res, next) => {
  const {
    user: { _id },
    body: { completions },
  } = req;

  instance.deleteCompletions(
    Array.isArray(completions) ? completions : [completions],
    _id
  );

  res.sendStatus(200);
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

  res.sendStatus(200);
};

const dumpCompletions = instance => async (req, res, next) => {
  try {
    const data = await import('./sample.json');

    res.json({ data }).sendStatus(200);
    await instance.insertCompletions(data.default);
  } catch (error) {
    return next(error);
  }

  res.sendStatus(200);
};

export {
  getCompletions,
  saveCompletions,
  deleteCompletions,
  incrementCompletion,
  dumpCompletions,
};
