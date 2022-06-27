import { default as express, Request, Response } from 'express';
import {
  normalizePort,
  onError,
  onListening,
  errorHandler,
  handle404,
} from '../appHelper.js';

import vhost from 'vhost';
import path from 'path';
import helmet from 'helmet';
import * as http from 'http';

import { default as logger } from 'morgan';
import cors from 'cors';
import session from 'express-session';
import { default as cookieParser } from 'cookie-parser';

import { router } from '../api/routes/index.js';

function createVirtualHost(domainName: string | RegExp, dirPath: string) {
  return vhost(domainName, express.static(dirPath));
}

const appHost = createVirtualHost(
  'www.amanahtoko.local',
  path.join(__dirname, '..', 'build', 'static')
);

export const initPool = async () => {
  const app = express();
  const port = normalizePort(process.env.PORT || '5000');
  app.set('port', port);
  // app.set('host', appHost);

  const server = http.createServer(app);
  server.listen(port, () => {
    console.log(
      `Server running at http://amanahtoko.local:%d: in %s mode`,
      port,
      app.settings.env
    );
  });
  server.on('error', (err) => {
    onError(err, port);
  });
  server.on('listening', () => {
    onListening(server);
  });

  app.use(logger('dev'));
  app.use(cors());
  app.use(helmet());
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(
    session({
      secret: 'veryveryimportantsecret',
      name: 'veryverysecretname',
      cookie: {
        httpOnly: true,
        sameSite: true,
        maxAge: 24 * 60 * 60 * 1000,
      },
      resave: false,
      saveUninitialized: true,
    })
  );
  app.use(
    '/static',
    express.static(path.join(__dirname, '..', 'build', 'static'))
  );
  app.use('/api/v1', router);

  // serve react build
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
  });

  app.use(handle404);
  app.use(errorHandler);
};
