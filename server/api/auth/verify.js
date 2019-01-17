import jwt from 'jsonwebtoken';

import { refreshTokens } from './token';

export default SECRET => async (req, res, next) => {
  const token = req.cookies['x-token'];

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Token missing',
    });

    return;
  }

  try {
    const user = jwt.verify(token, SECRET);
    const refreshToken = req.cookies['x-refresh-token'];

    res.status(200).json({
      success: true,
      message: 'verified',
      token,
      refreshToken,
      userId: user._id.toString(),
      userName: user.username,
    });
  } catch (err) {
    const refreshToken = req.cookies['x-refresh-token'];

    if (!refreshToken) {
      res.status(200).json({
        success: false,
        message: 'Refresh Token missing',
      });
    } else {
      const { newToken, newRefreshToken, user } = await refreshTokens(
        token,
        refreshToken,
        SECRET
      );

      if (newToken && newRefreshToken) {
        const hour = 60 * 60 * 1000;

        res.cookie('x-token', newToken, {
          maxAge: hour * 24 * 30,
          httpOnly: true,
        });
        res.cookie('x-refresh-token', newRefreshToken, {
          maxAge: hour * 24 * 180,
          httpOnly: true,
        });

        res.status(200).json({
          success: true,
          message: 'verified',
          newToken,
          newRefreshToken,
          userId: user._id.toString(),
          userName: user.username,
        });
      } else {
        res.status(200).json({
          success: false,
          message: 'Token expired',
        });
      }
    }
  }
};
