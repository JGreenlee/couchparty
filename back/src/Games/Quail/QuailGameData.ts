import { GameData, PublicGameData } from "../../GameData";

export type QVote = {
    playerName: string,
    colorIndex: number
}

export type QpaData = {
    player: string,
    promptText: string,
    answer: string,
    votes: QVote[],
    finished?: string
};

export class QuailGameData extends GameData {

    pairings: {
        promptId?: string[];
    };

    public: QuailPublicGameData;

    qPromptAnswers: {
        promptId?: QpaData[];
    };

    constructor(qgd: Partial<QuailGameData>) {
        super(qgd);
        this.public = qgd.public!;
        this.pairings = qgd.pairings || {};
        this.qPromptAnswers = qgd.qPromptAnswers || {};
        // this.qVotes = qgd.qVotes || {};
    }
}

export interface QuailPublicGameData {
    roundNumber: number;
    base: PublicGameData;
}