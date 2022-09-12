import { Socket } from 'socket.io'
import { GameData, PublicGameData } from "./GameData";

export abstract class PlayerData {

    isPlayerData: boolean = true;
    myName: string;

    abstract public: { base: PublicGameData }

    constructor(pd: Partial<PlayerData>) {
        this.myName = pd.myName || console.error('myName is not a string') || '';
    }
}

export abstract class Player {

    uid: string;
    socket: Socket;
    name: string;
    roomCode: string;

    eventListeners = {};

    abstract playerData: PlayerData;

    cards = {};

    /** 
     * Creates a Player. Called after a succesful 'requestJoin' event.
     * 
     * @param socket The socket used for communication with the player
     * @param name The player's name as displayed
     * @param uid The User ID of the device the player is using
     * @param roomCode the room code of the game being joined
     */
    protected constructor(socket: Socket, uid: string, roomCode: string, name: string) {
        this.socket = socket;
        this.uid = uid;
        this.roomCode = roomCode;
        this.name = name;
        socket['roomCode'] = roomCode;
        socket.join(socket['roomCode']);
        socket.on('disconnecting', (reason) => {
            console.log(this.name + '\'s socket is disconnecting. storing listeners');
            // Store socket event listeners before disconnecting
            socket.eventNames().forEach(eName => {
                this.eventListeners[eName] = socket.listeners(eName as string);
            });
        });
    }

    inform(gameData?: GameData): void {
        this.socket.emit('playerData', this.playerData);
    }

    applyNewSocket(socket: Socket) {
        return new Promise((res) => {
            this.socket = socket;
            for (const evName in this.eventListeners) {
                this.eventListeners[evName].forEach((listener) => {
                    this.socket.addListener(evName, listener);
                });
            }
            this.socket['roomCode'] = this.playerData.public.base.roomCode;
            console.log('listeners for player '+this.name+' transferred to new socket');
            socket.emit('debug', 'listeners for '+this.name+' transferred to this new socket');
            res(true);
        });
    }

    // // if a player gets disconnected and rejoins, this function send the data necessary
    // remind(gameData: GameData) {
    //     this.playerData.gameState = gameData.gameState;
    //     this.socket.emit('remind', this.playerData);
    // }
}

export abstract class Host extends Player {
    protected constructor(hostSocket: Socket, hostUid: string, roomCode: string) {
        super(hostSocket, hostUid, roomCode, 'HOST');
    }

    override inform(): void {
        throw Error('use game.informHost instead of host.inform');
    }
}