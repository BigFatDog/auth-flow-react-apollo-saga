import bcrypt from 'bcrypt';
import isNull from 'lodash/isNull';
import isUndefined from 'lodash/isUndefined';
import { createTokens } from './token';
import UserModel from '../user/model/UserModel';

// from app/core/auth/messages.js
const INVALID_CREDENTIALS = 'auth/fail/INVALID_CREDENTIALS';
const USER_NOT_FOUND = 'auth/fail/USER_NOT_FOUND';

// Verify username and password, if passed, we return jwt token for client
// We also include xsrfToken for client, which will be used to prevent CSRF attack
// and, you should use random complicated key (JWT Secret) to make brute forcing token very hard
const login = SECRET => async (req, res) => {
  const { username, password } = req.body;

  const failed = message =>
    res.status(200).json({
      success: false,
      message: message,
    });

  try {
    const foundUser = await UserModel.findOne({ username: username }).exec();

    if (isNull(foundUser) || isUndefined(foundUser)) {
      failed(USER_NOT_FOUND);
      return;
    }

    const passMatch = bcrypt.compareSync(password, foundUser.password);
    if (passMatch === false) {
      failed(INVALID_CREDENTIALS);
      return;
    }

    const [token, refreshToken] = await createTokens(SECRET, foundUser);

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
      message: 'Authentication Succeed',
      token,
      refreshToken,
      userId: foundUser._id.toString(),
      userName: username,
    });
  } catch (err) {
    failed(err);
  }
};

export default login;
