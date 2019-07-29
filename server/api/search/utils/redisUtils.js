import createPrefixModel from '../model/Prefix';
import { BASE_DOC_NAME } from '../constants';
import { toFullPrefix } from './prefixUtils';

const persistPrefix = async (redisClient, prefix, docName) => {
  const completions = await redisClient.zrangeAsync(
    prefix,
    0,
    -1,
    'WITHSCORES'
  );

  const prefixModel = createPrefixModel(docName);
  if (completions.length === 0) {
    await prefixModel.findOneAndDelete({ prefix });
  } else {
    await prefixModel.createIndexes({ prefix: 'text', background: true });
    await prefixModel.findOneAndUpdate(
      { prefix },
      { $set: { completions } },
      { new: true, upsert: true }
    );
  }
};
const persistPrefixes = async (redisClient, prefixes, token = null) => {
  for (let i = 0; i < prefixes.length; i++) {
    await persistPrefix(redisClient, prefixes[i], BASE_DOC_NAME);

    if (token !== null) {
      await persistPrefix(
        redisClient,
        prefixes[i],
        toFullPrefix(prefixes[i], token)
      );
    }
  }
};

export { persistPrefixes, persistPrefix };
