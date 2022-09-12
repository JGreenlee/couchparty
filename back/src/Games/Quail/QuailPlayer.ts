import { Host, Player, PlayerData } from '../../Player';
import { QpaData, QuailPublicGameData } from './QuailGameData';
import { Socket } from 'socket.io';
import { PublicGameData } from '../../GameData';

export class QuailPlayerData extends PlayerData {

    qPrompts: {
        promptId: string;
        promptText: string;
    }[] = [];

    qPromptAnswers?: {
        promptId?: QpaData[];
    };

    qMyVotes: {
        promptId?: number;
    } = {}

    public: QuailPublicGameData

    constructor(pd: Partial<QuailPlayerData>) {
        super(pd);
        this.public = pd.public!;
    }
}

export class QuailPlayer extends Player {

    playerData: QuailPlayerData;

    constructor(socket: any, uid: string, roomCode: string, publicGameData : QuailPublicGameData, name : string) {
        super(socket, uid, roomCode, name);
        this.playerData = new QuailPlayerData({
            myName: name,
            public: publicGameData
        });
    }
}

export class QuailHost extends Host {

    playerData : QuailPlayerData;

    constructor(socket: Socket, uid: string, roomCode: string, publicGameData: QuailPublicGameData) {
        super(socket, uid, roomCode);
        this.playerData = new QuailPlayerData({
            public: publicGameData
        });
    }
}