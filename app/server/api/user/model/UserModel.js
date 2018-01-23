import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: String,
  username: String,
  createdAt: Date,
  updatedAt: Date,
});

const UserModel = mongoose.model('User', userSchema);

export default UserModel;
