const logout = (req, res, next) => {
  res.clearCookie('x-token');
  res.clearCookie('x-refresh-token');

  res.status(200).json({
    success: true,
    message: 'cookie cleared. ',
  });
};

export default logout;
