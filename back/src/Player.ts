import { Socket } from 'socket.io'
import { GameData, GameState } from './Game';
import { QuailGameState } from './Games/Quail/QuailGame';

export class PlayerData {

    isPlayerData: boolean = true;
    myName: string;
    roomCode: string;
    scores?: { playerName?: number };
    gameState: GameState | QuailGameState;  // syncs with gameData.gameState

    constructor(pd: Partial<PlayerData>) {
        this.myName = pd.myName || console.error('myName is not a string') || '';
        this.roomCode = pd.roomCode || console.error('roomCode is not a string') || 'ERR';
        this.gameState = pd.gameState || console.error('gameState is not valid') || GameState.LOBBY;
        // scores is synced with gamedata.scores, not defined here
    }
}

export abstract class Player {

    UID: string;
    socket: Socket;
    name: string;
    gameId: string;

    eventListeners = {};

    abstract clientData: PlayerData;

    cards = {};

    /** 
     * Creates a Player. Called after a succesful 'requestJoin' event.
     * 
     * @param socket The socket used for communication with the player
     * @param name The player's name as displayed
     * @param uid The User ID of the device the player is using
     * @param gameId the room code of the game being joined
     */
    protected constructor(socket: Socket, name: string, uid: string, gameId: string) {
        this.socket = socket;
        this.name = name;
        this.UID = uid;
        this.gameId = gameId;
        socket.on('disconnecting', (reason) => {
            console.log(this.name + '\'s socket is disconnecting. storing listeners');
            // Store socket event listeners before disconnecting
            socket.eventNames().forEach(eName => {
                this.eventListeners[eName] = socket.listeners(eName as string);
            });
        });
    }

    // getClientData() {
    //     return this.gameData || this.playerData;
    // }

    inform(gameData?: GameData): void {
        if (gameData) {
            this.clientData.gameState = gameData.gameState;
        }
        this.socket.emit('playerData', this.clientData);
    }

    applyNewSocket(socket: Socket) {
        return new Promise((res,rej) => {
            this.socket = socket;
            for (const evName in this.eventListeners) {
                this.eventListeners[evName].forEach((listener) => {
                    this.socket.addListener(evName, listener);
                });
            }
            console.log('listeners for player '+this.name+' transferred to new socket');
            socket.emit('debug', 'listeners for '+this.name+' transferred to this new socket');
            res(true);
        });
    }

    // // if a player gets disconnected and rejoins, this function send the data necessary
    // remind(gameData: GameData) {
    //     this.clientData.gameState = gameData.gameState;
    //     this.socket.emit('remind', this.clientData);
    // }
}

export abstract class Host extends Player {
    protected constructor(socket: Socket, uid: string, gameId: string) {
        super(socket, 'HOST', uid, gameId);
    }

    override inform(): void {
        throw Error('use game.informHost instead of host.inform');
    }
}