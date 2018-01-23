import jwt from 'jsonwebtoken';
import pick from 'lodash/pick';
import UserModel from '../user/model/UserModel';

export const createTokens = async (SECRET, user) => {
  const tokenUser = pick(user, ['_id', 'username']);
  const createToken = jwt.sign(tokenUser, SECRET, {
    expiresIn: '30 days',
  });

  const createRefreshToken = jwt.sign(tokenUser, SECRET + user.password, {
    expiresIn: '180 days',
  });

  return Promise.all([createToken, createRefreshToken]);
};

export const refreshTokens = async (token, refreshToken, SECRET) => {
  try {
    const { _id, username } = jwt.decode(refreshToken);

    if (!_id || !username) {
      return {};
    }

    const foundUser = await UserModel.findOne({ _id: _id });
    if (!foundUser) {
      return {};
    }
    const refreshSecret = SECRET + foundUser.password;

    try {
      jwt.verify(refreshToken, refreshSecret);
    } catch (err) {
      return {};
    }

    const [newToken, newRefreshToken] = await createTokens(SECRET, foundUser);

    return {
      newToken,
      newRefreshToken,
      user: pick(foundUser, ['_id', 'username']),
    };
  } catch (err) {
    return {};
  }
};
