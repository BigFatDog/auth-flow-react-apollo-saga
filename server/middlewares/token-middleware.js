import jwt from 'jsonwebtoken';

import { refreshTokens } from '../api/auth/token';

export default SECRET => async (req, res, next) => {
  const token = req.cookies['x-token'] || req.headers['token'];

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Token missing',
    });

    return;
  }

  try {
    req.user = jwt.verify(token, SECRET);

    next();
  } catch (err) {
    const refreshToken =
      req.cookies['x-refresh-token'] || req.headers['refreshToken'];

    if (!refreshToken) {
      res.status(401).json({
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
        res.set('Access-Control-Expose-Headers', 'x-token, x-refresh-token');

        const hour = 60 * 60 * 1000;
        res.cookie('x-token', newToken, {
          maxAge: hour * 24 * 30,
          httpOnly: true,
        });
        res.cookie('x-refresh-token', newRefreshToken, {
          maxAge: hour * 24 * 180,
          httpOnly: true,
        });

        req.user = user;
        next();
      } else {
        res.status(401).json({
          success: false,
          message: 'Token expired',
        });
      }
    }
  }
};
