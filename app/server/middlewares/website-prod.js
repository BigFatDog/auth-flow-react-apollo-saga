import path from 'path';
import express from 'express';
import compression from 'compression';

const addProdMiddlewares = (app, ssr) => {
  const publicPath = '/';
  const outputPath = path.resolve(process.cwd(), 'build');

  // compression middleware compresses your server responses which makes them
  // smaller (applies also to assets). You can read more about that technique
  // and other good practices on official Express.js docs http://mxs.is/googmy
  app.use(compression());
  app.use(publicPath, express.static(outputPath));
  app.get('*', (req, res) =>
    res.sendFile(path.resolve(outputPath, 'index.html'))
  );
};

export default addProdMiddlewares;
