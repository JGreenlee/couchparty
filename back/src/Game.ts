// abstract class

import { Socket } from 'socket.io';
import { GameData } from './GameData';
import { Player, Host } from './Player';
import { PlayerList } from './PlayerList';

export abstract class Game {

    roomCode: string;

    host: Host;
    destroyMethod?: CallableFunction;
    onFinished! : CallableFunction;

    abstract gameTypeName: string;
    abstract gameData: GameData;
    abstract playerList: PlayerList<Player>;

    /**
     * Logic to create a Game. Called by super() in a subclass's constructor
     * 
     * @param hostSocket The Socket used for communication with the Host of the Game
     * @param hostUid The User ID assigned to the device the Host is using
     * @param roomCode The 4-letter code that will be used to identify this Game
     */
    protected constructor(hostSocket: Socket, hostUid: string, roomCode: string, gameData: GameData) {

        this.roomCode = roomCode;
        this.host = this.createHost(hostSocket, hostUid, roomCode, gameData);
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

        this.host.socket.on('startGame', (callback) => {
            this.host.socket.removeAllListeners('startGame');
            this.initScores();
            this.start().then(callback);
        });
    }

    initScores() {
        this.gameData.public.base.scores = {};
        for (let i = 0; i < this.playerList.names.length; i++) {
            this.gameData.public.base.scores[this.playerList.names[i]] = 0;
            this.playerList.objs[i].playerData.public.base.scores = this.gameData.public.base.scores;
        }
    }

    // joins this game, creates a Player and returns the Player object
    join(playerSocket: Socket, playerUid: string, playerName: string): Player {
        let p = this.createPlayer(playerSocket, playerUid, this.roomCode, playerName);
        this.playerList.add(playerName, p);
        this.informHost();
        console.log("player " + playerName + " joined game");
        return p;
    }

    abstract createPlayer(playerSocket: Socket, playerUid: string, roomCode: string, playerName: string,): Player  // abstract
    abstract createHost(hostSocket: Socket, hostUid: string, roomCode: string, gameData : GameData): Host // abstract

    informHost() {
        this.host.socket.emit('gameData', this.gameData);
    }

    informAllPlayers() {
        for (let i = 0; i < this.playerList.names.length; i++) {
            this.playerList.objs[i].inform(this.gameData);
        }
    }

    leave(socket: Socket) {
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
}