import { Server } from 'socket.io';
import { QuailGame, QuailGameOptions } from "./Games/Quail/QuailGame";
import { Game, GameState } from "./Game";
import { Player } from './Player';
import * as util from './util/util';

export class CouchSocket {

    io: Server;
    activeGames: { [roomCode: string]: Game } = {};

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
                    disconnG = this.activeGames[pubId];
                    if (disconnG && disconnG.host.socket == socket) {
                        console.log(socket.id + ' was host, destroying game in 3 min');
                        const threeMins = 180000;
                        this.activeGames[pubId].hostConnection(new Date().getMilliseconds() + threeMins);
                        // destroy game after 3 minutes if host does not reconnect
                        setTimeout(() => {
                            if (socket.disconnected) {
                                delete this.activeGames[pubId];
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

            socket.on('register', (rd, ackRegister) => {
                console.log('registering');

                if (rd && rd.storedUID) {
                    if (rd.roomCode) {
                        const g = this.activeGames[rd.roomCode];
                        if (g) {
                            let matchedPlayer: Player | undefined;
                            let matchedIsHost: boolean = false;
                            if (g.host.UID == rd.storedUID) {
                                matchedPlayer = g.host;
                                matchedIsHost = true;
                            } else {
                                matchedPlayer = g.playerList.objs.find(p => { return p.UID == rd.storedUID });
                            }

                            if (matchedPlayer) {
                                console.log('reminding ' + matchedPlayer.name + ' who returned to game ' + g.roomCode);
                                matchedPlayer.socket = socket;
                                if (matchedIsHost) {
                                    ackRegister(rd.storedUID, g.gameData);
                                } else {
                                    ackRegister(rd.storedUID, matchedPlayer.clientData);
                                }
                            }
                        }

                        // TODO remind logic
                        console.log('remembered client, storedUID = ' + rd.storedUID);
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
                        ackRegister(rd.storedUID);
                    }
                } else {
                    console.log('making new uid');
                    const uid = Math.random().toString(36).substring(3, 16) + new Date().getMilliseconds();
                    // TODO check UID is not already taken
                    ackRegister(uid);
                }
            });

            socket.on('createGame', (gameOptions) => {
                // add terminateGame listener
                socket.once('terminateGame', (termCallback: CallableFunction) => {
                    if (socket.roomCode && this.activeGames[socket.roomCode]) {
                        delete this.activeGames[socket.roomCode];
                        console.log('deleted game ' + socket.roomCode);
                        termCallback();
                    }
                });

                const roomCode = util.generateRoomCode(Object.keys(this.activeGames));
                g = new QuailGame(socket, this.io, roomCode, gameOptions);
                socket.roomCode = g.gameData.roomCode;
                socket.join(socket.roomCode);
                this.activeGames[g.gameData.roomCode] = g;
                console.log("created game", g.gameData.roomCode);
                g.informHost();
            });

            socket.on('requestJoin', (r, callback: CallableFunction) => {
                let foundGame = this.activeGames[r.roomCode];
                if (foundGame) {
                    if (!foundGame.playerList.names.includes(r.name)) {
                        let p = foundGame.join(socket, r.name, r.uid);
                        callback(true, p.clientData);
                    } else {
                        callback(false, 'name is taken');
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
