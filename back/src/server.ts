import express from 'express';
import path from 'path';
import http from 'http';

import { CouchSocket } from './CouchSocket';

const app = express();
app.use(express.static(path.join(__dirname, '/../../front/dist/front')));

const httpConn = http.createServer(app);

// export const sio =
new CouchSocket(httpConn, {
    path: '/socket.io',
    cors: true,
    origins: ["*"]
});

const PORT = process.env['PORT'] || 3000;
httpConn.listen(PORT, () => console.log('Server is running on port ' + PORT));