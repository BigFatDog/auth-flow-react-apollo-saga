import mongoose, { Schema } from 'mongoose';

const map = {};

const createPrefixModel = token => {
  if (map[token]) {
    return map[token];
  }

  const PrefixSchema = new Schema({
    _id: String,
    prefix: String,
    completions: Array,
  });

  const model = mongoose.model(`${token}`, PrefixSchema);
  map[token] = model;
  return model;
};

export default createPrefixModel;
