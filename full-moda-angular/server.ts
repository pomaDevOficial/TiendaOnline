import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr/node';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import bootstrap from './src/main.server';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const app = express();
const commonEngine = new CommonEngine();

// Serve static files from /browser
app.get('*.*', express.static(browserDistFolder, {
  maxAge: '1y'
}));

// All regular routes use the Angular engine
app.get('*', (req, res, next) => {
  const { protocol, originalUrl, baseUrl, headers } = req;

  commonEngine
    .render({
      bootstrap,
      documentFilePath: join(browserDistFolder, 'index.html'),
      url: `${protocol}://${headers.host}${originalUrl}`,
      publicPath: browserDistFolder,
      providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
    })
    .then((html) => res.send(html))
    .catch((err) => next(err));
});

const port = process.env['PORT'] || 4000;

// Start the server
app.listen(port, () => {
  console.log(`Node Express server listening on http://localhost:${port}`);
});