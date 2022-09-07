// abstract class

import { Server, Socket } from "socket.io";
import { QuailGameState } from "./Games/Quail/QuailGame";
import { Player, Host } from "./Player";
import { PlayerList } from "./PlayerList";
import * as util from './util/util';

export abstract class GameData {

    roomCode: string;
    gameState: GameState | QuailGameState;
    scores: { playerName?: number };
    playerNames: string[];

    constructor(gd: Partial<GameData>) {
        this.roomCode = gd.roomCode || console.error("roomCode is not a string") || 'ERR';
        this.gameState = gd.gameState || console.error("gameState invalid") || GameState.PAUSED;
        this.scores = gd.scores || {};
        this.playerNames = gd.playerNames || [];
    }
}

export enum GameState {
    LOBBY = 'lobby',
    PAUSED = 'paused'
}

export abstract class Game {

    roomCode: string;

    host: Host;

    abstract gameTypeName: string;
    abstract gameData: GameData;
    abstract playerList: PlayerList<Player>;

    protected constructor(hostSocket: Socket, socketIoServer: Server) {

        this.roomCode = util.generateRoomCode();

        const uid = '000000000000'; // TODO placeholder UID for host
        this.host = this.createHost(hostSocket, uid, this.roomCode);
        console.log('host joined game');

        this.host.socket.on('bootPlayer', (nameToBoot) => {
            const toBoot = this.playerList.getByName(nameToBoot);
            if (toBoot) {
                toBoot.socket.emit('sioPerform', 'onBooted', 'bummer');
                this.playerList.removeByName(nameToBoot);
                this.informHost();
                console.log('booted ' + nameToBoot);
            }
        });

        this.host.socket.once('startGame', (callback) => {
            this.initScores();
            this.start().then(callback);
        });
    }

    initScores() {
        this.gameData.scores = {};
        for (let i = 0; i < this.playerList.names.length; i++) {
            this.gameData.scores[this.playerList.names[i]] = 0;
            this.playerList.objs[i].clientData.scores = this.gameData.scores;
        }
    }

    // joins this game, creates a Player and returns the Player object
    join(socket : Socket, name : string, uid : string): Player {
        let p = this.createPlayer(socket, name, uid);
        this.playerList.add(name, p);
        this.informHost();
        console.log("player " + name + " joined game");
        return p;
    }

    abstract createPlayer(socket: Socket, name: string, uid: string): Player  // abstract
    abstract createHost(socket: Socket, uid: string, gameId: string): Host // abstract

    informHost() {
        console.debug(this.gameData);
        this.host.socket.emit('gameData', this.gameData);
    }

    informAllPlayers() {
        for (let i = 0; i < this.playerList.names.length; i++) {
            this.playerList.objs[i].inform(this.gameData);
        }
    }

    leave(socket : Socket) {
        for (let i = 0; i < this.playerList.names.length; i++) {
            if (this.playerList.objs[i].socket == socket) {
                console.log('removing from gamedata.players: ' + this.playerList.names[i]);
                this.playerList.remove(i);
                this.informHost();
            }
        }
    }

    abstract start(): Promise<void> // abstract

    // getPlayerWithUID(UID): Player | null {
    //     const found = this.playerList.find(player => player.UID == UID);
    //     if (found)
    //         return found;
    //     else {
    //         console.log('player with uid ' + UID + ' not found');
    //         return null;
    //     }
    // }

    // TODO use broadcast or toRoom instead of emitting all
    hostConnection(destroyTime: number) {
        this.playerList.objs.forEach((p) => {
            p.socket.emit('hostConnection', destroyTime);
        });
    }
}