import { Host, Player, PlayerData } from "../../Player";
import { GameState } from "../../Game";
import { QpaData, QuailGameData } from "./QuailGameData";
import { Socket } from "socket.io";

export class QuailPlayerData extends PlayerData {

    qPrompts: {
        promptId: string;
        promptText: string;
    }[];

    qPromptAnswers?: {
        promptId?: QpaData[];
    };

    qMyVotes: {
        promptId?: number;
    }

    constructor(pd: Partial<QuailPlayerData>) {
        super(pd);
        this.qPrompts = [];
        this.qMyVotes = {};
        // qpa is synced with gamedata.qpa, not defined here
    }
}

export class QuailPlayer extends Player {

    clientData: QuailPlayerData;

    constructor(socket: any, name: string, uid: string, gameId: string) {
        super(socket, name, uid, gameId);
        this.clientData = new QuailPlayerData({
            myName: name,
            roomCode: gameId,
            gameState: GameState.LOBBY,
            qPrompts: []
        });
    }
}

export class QuailHost extends Host {

    clientData: QuailPlayerData;

    constructor(socket: Socket, uid: string, gameId: string, gd: QuailGameData) {
        super(socket, uid, gameId);
        this.clientData = new QuailPlayerData({
            roomCode: gameId,
            gameState: GameState.LOBBY,
        });
    }
}