import { QuailGameState } from './Games/Quail/QuailGame';

export abstract class GameData {

    isGameData: boolean = true;
    playerNames: string[];
    abstract public: { base: PublicGameData; }

    constructor(gd: Partial<GameData>) {
        this.playerNames = gd.playerNames || [];
    }
}

// game data that is known to both the host and all players
export interface PublicGameData {
    scores: { playerName?: number };
    roomCode: string;
    gameState: GameState | QuailGameState;
    hostDisconnected: number;
}

export type GameState = 'LOBBY' | 'PAUSED' | 'FINISHED' | 'TERMINATED';