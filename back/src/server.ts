import express from 'express';
import http from 'http';

import { Game } from "./Game";
import { CouchSocket } from './CouchSocket';

const app = express();
app.use(express.static(__dirname + '/../public'))

export let activeGames: { [roomCode: string]: Game } = {};

const httpConn = http.createServer(app);

// export const sio =
new CouchSocket(httpConn, {
    path: '/socket.io',
    cors: true,
    origins: ["*"]
});

const PORT = process.env['PORT'] || 3000;
httpConn.listen(PORT, () => console.log('Server is running on port ' + PORT));