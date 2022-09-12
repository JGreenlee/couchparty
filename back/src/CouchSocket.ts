import { Server } from 'socket.io';
import { QuailGame } from './Games/Quail/QuailGame';
import { Game } from './Game';
import { Player } from './Player';
import * as util from './util/util';
import { Socket } from 'dgram';

export class CouchSocket {

    io: Server;
    activeGames: { [roomCode: string]: Game } = {};

    constructor(conn, args) {
        this.io = new Server(conn, args);
        this.io.on('connection', (socket: any) => {

            if (process.env.DEBUG_LATENCY) {
                const emitFn = socket.emit;
                socket.emit = (...args) => setTimeout(() => {
                    emitFn.apply(socket, args)
                }, 1000);
            }

            socket.on('qPing', (ack) => {
                ack();
            });

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
                        disconnG.gameData.public.base.hostDisconnected = Date.now() + threeMins;
                        if (!disconnG.destroyMethod) {
                            disconnG.destroyMethod = () => {
                                if (!disconnG.host.socket || disconnG.host.socket == socket) {
                                    if (this.activeGames[pubId]) {
                                        disconnG.gameData.public.base.gameState = 'TERMINATED';
                                        disconnG.informAllPlayers();
                                        delete this.activeGames[pubId];
                                        console.log('deleted game ' + pubId);
                                    } else {
                                        console.log('game ' + pubId + ' was already deleted');
                                    }
                                }
                            }
                            // destroy game after 3 minutes if host does not have a new socket by then
                            setTimeout(disconnG.destroyMethod, threeMins)
                        }
                        disconnG.informAllPlayers();
                    }
                }

                if (g && g.gameData.public.base.gameState == 'LOBBY') {
                    g.leave(socket);
                } else {
                    console.log('lost connection to ' + socket.id);
                }
            });

            socket.on('register', (rd, ackRegister) => {
                if (rd && rd['uid']) {
                    if (rd['roomCode']) {
                        const g = this.activeGames[rd['roomCode']];
                        if (g) {
                            let matchedPlayer: Player | undefined;
                            let matchedIsHost: boolean = false;
                            if (g.host.uid == rd['uid']) {
                                matchedPlayer = g.host;
                                matchedIsHost = true;
                            } else {
                                matchedPlayer = g.playerList.objs.find(p => { return p.uid == rd['uid'] });
                            }

                            if (matchedPlayer) {
                                if (!matchedPlayer.socket.connected) {
                                    console.log('found player ' + matchedPlayer.name + ', ' + (matchedIsHost ? 'is host' : 'is not host'));
                                    console.log('reminding ' + matchedPlayer.name + ' who returned to game ' + g.roomCode);
                                    matchedPlayer.applyNewSocket(socket).then(() => {
                                        if (matchedIsHost) {
                                            g.destroyMethod = undefined;
                                            g.gameData.public.base.hostDisconnected = 0;
                                            g.informAllPlayers();
                                            ackRegister(rd['uid'], g.gameData);
                                        } else {
                                            ackRegister(rd['uid'], matchedPlayer?.playerData);
                                        }
                                        socket['uid'] = rd['uid'];
                                    });
                                    return;
                                } else {
                                    ackRegister(false, 'duplicate');
                                    return;
                                }
                            }
                            console.log('found game but did not remind player');
                        }
                    }
                    console.log('uid remembered as ' + rd['uid'] + ' but not in any active game.', 'roomcode was', rd.roomCode);
                    socket['uid'] = rd['uid'];
                    ackRegister(rd['uid']);
                } else {
                    socket['uid'] = rd['uid'];
                    ackRegister(util.generateUid());
                }
            });

            socket.on('createGame', (hostUid, gameOptions) => {

                if (socket.roomCode && this.activeGames[socket.roomCode]) {
                    console.log('you already have a game');
                    this.activeGames[socket.roomCode].informHost();
                    return;
                }

                // add terminateGame listener
                socket.on('terminateGame', (termCallback: CallableFunction) => {
                    socket.removeAllListeners('terminateGame');
                    if (socket.roomCode && this.activeGames[socket.roomCode]) {
                        this.activeGames[socket.roomCode].gameData.public.base.gameState = 'TERMINATED';
                        this.activeGames[socket.roomCode].informAllPlayers();
                        delete this.activeGames[socket.roomCode];
                        console.log('deleted game ' + socket.roomCode);
                        termCallback(true);
                    } else {
                        termCallback(false);
                    }
                });

                const roomCode = util.generateRoomCode(Object.keys(this.activeGames));
                g = new QuailGame(socket, hostUid, roomCode, gameOptions);
                g.onFinished = (game : Game) => {
                    delete this.activeGames[game.gameData.public.base.roomCode];
                }
                this.activeGames[g.gameData.public.base.roomCode] = g;
                console.log("created game", g.gameData.public.base.roomCode);
                g.informHost();
            });

            socket.on('requestJoin', (r: { uid: string, roomCode: string, name: string }, callback: CallableFunction) => {
                let foundGame = this.activeGames[r.roomCode];
                if (foundGame) {
                    if (util.isValidUid(r.uid)) {
                        if (r.name.length > 0) {
                            // if desired name not already in playerList
                            if (!foundGame.playerList.names.includes(r.name)) {
                                let p = foundGame.join(socket, r.uid, r.name);
                                callback(true, p.playerData);
                            } else {
                                callback(false, 'name is taken');
                            }
                        } else {
                            callback(false, 'name too short');
                        }
                    } else {
                        callback(false, 'invalid uid');
                    }
                } else {
                    callback(false, 'room not found');
                }
            });
        });
    }
}
