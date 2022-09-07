import { Socket } from '../node_modules/socket.io'
import { GameData, GameState } from './Game';
import { QuailGameState } from './Games/Quail/QuailGame';

export class PlayerData {

    myName: string;
    roomCode: string;
    scores? : { playerName?: number };
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

    abstract clientData: PlayerData;

    cards = {};

    protected constructor(socket: Socket, name: string, uid: string, gameId: string) {
        this.socket = socket;
        this.name = name;
        this.UID = uid;
        this.gameId = gameId;
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