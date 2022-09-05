import express from 'express';
import socket, { Server } from 'socket.io';
import http from 'http';

import { QuailGame, QuailGameOptions } from "./Games/Quail/QuailGame";
import { Game, GameState } from "./Game";

const app = express();
app.use(express.static(__dirname + '/../public'))

let activeGames: { [roomCode: string]: Game } = {};

const httpConn = http.createServer(app);

// singleton Socket - so we can use the same socket instance everywhere we need it
class Socket {
    io: Server;

    constructor(conn, args) {
        this.io = new Server(conn, args);
        this.io.on('connection', (socket: any) => {

            let g: Game;
            console.log('connected ' + socket.id);

            socket.on('disconnect', () => {
                console.log('disconnected ' + socket.id);
                let pubId: string = socket.roomCode;
                let disconnG: Game;
                if (pubId && pubId != "TEST") {
                    disconnG = activeGames[pubId];
                    if (disconnG && disconnG.host.socket == socket) {
                        console.log(socket.id + ' was host, destroying game in 3 min');
                        const threeMins = 180000;
                        activeGames[pubId].hostConnection(new Date().getMilliseconds() + threeMins);
                        // destroy game after 3 minutes if host does not reconnect
                        setTimeout(() => {
                            if (socket.disconnected) {
                                delete activeGames[pubId];
                                console.log('deleted game ' + pubId);
                            }
                        }, threeMins);
                    }
                }

                if (g && g.gameData.gameState == GameState.LOBBY) {
                    g.leave(socket);
                } else {
                    console.log('lost connection to ' + socket.id);
                }
            });

            socket.on('register', (storedUID, ackRegister) => {
                console.log('registering');

                if (storedUID) {
                    ackRegister(storedUID);

                    // TODO remind logic
                    // console.log('remembered client, storedUID = ' + storedUID);
                    // // when found client who reconnected, let's get em back on track
                    // // REMIND LOGIC
                    // let client: Player | null;
                    // const isHost = storedUID == this.host.UID;
                    // if (isHost) {
                    //     client = this.host;
                    //     this.hostConnection(0); // 0 indicates reconnected, not disconnected
                    // } else {
                    //     client = this.getPlayerWithUID(storedUID);
                    // }
                    // if (client) {
                    //     console.log('remembered client is ' + client.name);
                    //     // when client recognized, remind them
                    //     client.socket = socket;
                    //     client.clientData.gameState = this.gameData.gameState;
                    //     ackRegister(storedUID, client.clientData);
                    // } else {
                    //     console.log('player with UID ' + storedUID +" not found");
                    // }

                } else {
                    console.log('making new uid');
                    const uid = Math.random().toString(36).substring(3, 16) + new Date().getMilliseconds();
                    // TODO check UID is not already taken
                    ackRegister(uid);
                }
            });

            socket.on('createGame', (gameType: string, gameOptions: QuailGameOptions) => {
                socket.once('terminateGame', (termCallback: CallableFunction) => {
                    if (socket.roomCode && activeGames[socket.roomCode]) {
                        delete activeGames[socket.roomCode];
                        console.log('deleted game ' + socket.roomCode);
                        termCallback();
                    }
                });
                // TODO choose types of games (gameType==0)
                g = new QuailGame(socket, this.io, gameOptions);
                socket.roomCode = g.gameData.roomCode;
                socket.join(socket.roomCode);
                activeGames[g.gameData.roomCode] = g;
                console.log("created game", g.gameData.roomCode);
                g.informHost()
            });

            socket.on('requestJoin', (r, callback: CallableFunction) => {
                let foundGame = activeGames[r.roomCode];
                if (foundGame) {
                    if (!foundGame.playerList.names.includes(r.name)) {
                        let p = foundGame.join(socket, r.name, r.uid);
                        callback(true, p.clientData);
                    } else {
                        callback(false, 'name is taken')
                    }
                } else {
                    callback('room not found');
                }
            });
        });
        this.io.on('qClientPing', (ack) => {
            ack();
        });
    }
}

export const sio = new Socket(httpConn, {
    path: '/socket.io',
    cors: true,
    origins: ["*"]
});

const PORT = process.env['PORT'] || 3000;
httpConn.listen(PORT, () => console.log('Server is running on port ' + PORT));