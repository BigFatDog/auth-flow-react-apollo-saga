import bcrypt from 'bcrypt';
import isNull from 'lodash/isNull';
import isUndefined from 'lodash/isUndefined';

import { createTokens } from './token';
import UserModel from '../user/model/UserModel';

const SALT_ROUNDS = 10;

// from app/core/auth/messages.js
export const USER_ALREADY_EXIST = 'auth/fail/USER_ALREADY_EXIST';
export const EMAIL_ALREADY_EXIST = 'auth/fail/EMAIL_ALREADY_EXIST';

const register = SECRET => async (req, res) => {
  const { username, email, password } = req.body;

  const failed = message =>
    res.status(200).json({
      success: false,
      message: message,
    });

  try {
    const existedUser = await UserModel.findOne({
      $or: [{ username: username }, { email: email }],
    }).exec();

    if (!isNull(existedUser) && !isUndefined(existedUser)) {
      if (existedUser.email && existedUser.email === email)
        failed(EMAIL_ALREADY_EXIST);
      else failed(USER_ALREADY_EXIST);

      return;
    }

    // good to go
    const hashedPass = bcrypt.hashSync(password, SALT_ROUNDS);

    const newUser = new UserModel({
      username: username,
      email: email,
      password: hashedPass,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedUser = await newUser.save();

    const [token, refreshToken] = await createTokens(SECRET, savedUser);

    const hour = 60 * 60 * 1000;
    res.cookie('x-token', token, {
      maxAge: hour * 24 * 30,
      httpOnly: true,
    });
    res.cookie('x-refresh-token', refreshToken, {
      maxAge: hour * 24 * 180,
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      message: 'SignUp completed',
      token,
      refreshToken,
      userId: savedUser._id.toString(),
      userName: username,
    });
  } catch (err) {
    failed(err);
  }
};

export default register;
