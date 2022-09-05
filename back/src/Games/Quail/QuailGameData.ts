import { GameData } from '../../Game';

export type QVote = {
    playerName: string,
    colorIndex: number
}

export type QpaData = {
    player: string,
    promptText: string,
    answer: string,
    votes: QVote,
    finished?: string
};

export class QuailGameData extends GameData {


    pairings: {
        promptId?: string[];
    };
    /*  // example pairings
        gameData.pairings = {
            'animal' : ['p1', 'p2'],
            'biome' : ['p2', 'p3'],
            'operating-system' : ['p1', 'p3']
        };
    */

    qPromptAnswers: {
        promptId?: QpaData[];
    };
    /*  // example qPromptAnswers
    gameData.qPromptAnswers = {
        'animal' : [
            { playerName: 'p1', answer: 'dog' },
            { playerName: 'p2', answer: 'mouse' }
        ],
        'biome' : [
            { playerName: 'p2', answer: 'desert' },
            { playerName: 'p3', answer: 'rainforest' }
        ],
        'operating-system' : [
            { playerName: 'p1', answer: 'windows' },
            { playerName: 'p3', answer: 'linux' }
        ],
    };
    */

    // qVotes: {
    //     promptId?: {
    //         player: string;
    //         answer: string;
    //         votes: number
    //     }[];
    // };

    roundNumber: number = 0;

    constructor(qgd: Partial<QuailGameData>) {
        super(qgd);
        this.pairings = qgd.pairings || {};
        this.qPromptAnswers = qgd.qPromptAnswers || {};
        // this.qVotes = qgd.qVotes || {};
    }
}
