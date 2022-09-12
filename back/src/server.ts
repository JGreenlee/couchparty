import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import http from 'http';
import compression from 'compression';

import { CouchSocket } from './CouchSocket';
import path from 'path';

// config
const PORT = process.env['PORT'] || 3000;
const distFolder = "/../../front/dist/front";
const options = {
  dotfiles: 'ignore',
  etag: false,
  extensions: ['html', 'js', 'scss', 'css'],
  index: false,
  maxAge: '1y',
  redirect: true,
}

// create app
const app = express();
app.use(compression());
app.use(express.static(path.join(__dirname, distFolder), options));

// serve angular paths
app.get('*', function (req, res) {
    res.status(200).sendFile(`/`, {root: path.join(__dirname, distFolder)});
});

const httpConn = http.createServer(app);

// export const sio =
new CouchSocket(httpConn, {
    path: '/socket.io',
    pingTimeout: 10000,
    pingInterval: 1000,
    cors: true,
    origins: ["*"]
});

httpConn.listen(PORT, () => console.log('Server is running on port ' + PORT));