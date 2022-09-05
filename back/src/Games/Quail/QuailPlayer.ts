import { Host, Player, PlayerData } from "../../Player";
import { GameState } from "../../Game";
import { QpaData, QuailGameData } from "./QuailGameData";
import { Socket } from "socket.io";

export class QuailPlayerData extends PlayerData {

    qPrompts: { promptId: string; promptText: any; }[];
    /*  // example qPrompts
        playerData.qPrompts = [
            { promptId: 'animal', promptText: 'dog'},
            { promptId: 'biome', promptText: 'rainforest'},
        ]
    */

    qVotingMatchups?: {
        promptId?: QpaData[];
    };
    /*  // example qVotingMatchups
        playerData.qVotingMatchups = {
            'promptId': [
                { playerName: 'p1', answer: 'foo' },
                { playerName: 'p2', answer: 'bar' }
            ]
        }
    */

    qMyVotes: {
        promptId?: number;
    }
    /*  // example qVotingMatchups
    playerData.qVotingMatchups = {
        'animal': 0,
        'biome': 1,
        'operating-system': 0
    }
*/

    constructor(pd: Partial<QuailPlayerData>) {
        super(pd);
        this.qPrompts = [];
        this.qMyVotes = {};
    }
}

export class QuailPlayer extends Player {

    clientData: QuailPlayerData;

    constructor(socket: any, name: string, uid: string, gameId: string) {
        super(socket, name, uid, gameId);
        this.clientData = new QuailPlayerData({ myName: name, roomCode: gameId, gameState: GameState.LOBBY, qPrompts: [] });
    }
}

export class QuailHost extends Host {

    clientData: QuailPlayerData;
    // gameData: QuailGameData;

    constructor(socket: Socket, uid: string, gameId: string, gd: QuailGameData) {
        super(socket, uid, gameId);
        this.clientData = new QuailPlayerData(
            {
                roomCode: gameId,
                gameState: GameState.LOBBY,
            });
    }
}