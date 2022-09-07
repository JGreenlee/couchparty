import { Game, GameState } from '../../Game';
import { PlayerList } from '../../PlayerList';
import { QpaData, QuailGameData, QVote } from './QuailGameData';
import { QuailHost, QuailPlayer } from "./QuailPlayer";
import prompts from './prompts.json';
import * as util from '../../util/util';

export const GAME_TYPE_NAME_QUAIL: string = 'quail';

export interface QuailGameOptions {
    maxPlayers: number,
    promptPacks: string[],
    redHerrings: boolean
}

export enum QuailGameState {
    INTRO = 'intro',                // tutorial
    ANSWERING = 'answering',        // prompts have been sent, waiting for players' answers
    VOTING = 'voting',              // answers received, voting has begun
    LEADERBOARD = 'leaderboard'     // viewing scores
}

export class QuailGame extends Game {

    gameTypeName: string = GAME_TYPE_NAME_QUAIL;
    gameOptions: QuailGameOptions;
    gameData: QuailGameData;

    playerList: PlayerList<QuailPlayer>;

    constructor(hostSocket, socketIoServer, gameOptions: QuailGameOptions) {
        super(hostSocket, socketIoServer);
        this.gameOptions = gameOptions;
        this.gameData = new QuailGameData({
            roomCode: this.roomCode,
            gameState: GameState.LOBBY,
        });
        this.playerList = new PlayerList();
        this.gameData.playerNames = this.playerList.names;
    }

    start(): Promise<void> {
        return this.startRound();
    }

    startRound(): Promise<void> {
        this.gameData.pairings = {};
        this.gameData.qPromptAnswers = {};

        for (let i = 0; i < this.playerList.names.length; i++) {
            const p = this.playerList.objs[i]
            p.clientData.qMyVotes = {};
            p.clientData.qPrompts = [];
            p.clientData.qPromptAnswers = this.gameData.qPromptAnswers;
        }

        return new Promise<void>(() => {
            this.sendPrompts();
            this.informHost();
        });
    }

    allPlayersAnswered(): boolean {
        for (const player of this.playerList.names) {
            if (!this.gameData.qPromptAnswers || !(Object.values(this.gameData.qPromptAnswers).find(o => { return o.find(q => { return q.player == player }) }))) {
                return false;
            }
        }
        return true;
    }

    assignPairings() {
    }

    sendPrompts() {
        this.gameData.gameState = QuailGameState.ANSWERING;

        const promptsArr = Object.keys(prompts);
        const numOfPrompts = this.playerList.names.length;
        const randPrompts = util.getRandFrom(promptsArr, numOfPrompts);

        for (let i = 0; i < numOfPrompts; i++) {

            const player = this.playerList.objs[i];

            // assign prompts to player
            this.assignPrompts(player, i, numOfPrompts, randPrompts)

            // what to do when answers come in
            player.socket.once('qAnswers', (r: { promptId: string; promptAnswer: any; }[], ack) => {

                r.forEach((prom) => {
                    this.gameData.qPromptAnswers[prom.promptId] ||= [];
                    this.gameData.qPromptAnswers[prom.promptId].push(
                        { player: player.name, promptText: prompts[prom.promptId], answer: prom.promptAnswer }
                    );
                });
                this.informHost();
                if (this.allPlayersAnswered()) {
                    this.startVoting();
                }
                ack(true);
            });

            // inform player of their prompts
            player.inform(this.gameData);
        }
    }

    assignPrompts(player: QuailPlayer, i, numOfPrompts, randprompts) {
        const firstChosenPrompt = randprompts[i % numOfPrompts];
        const secondChosenPrompt = randprompts[(i + 1) % numOfPrompts];

        this.gameData.pairings[firstChosenPrompt] ||= [];
        this.gameData.pairings[secondChosenPrompt] ||= [];

        this.gameData.pairings[firstChosenPrompt].push(this.playerList.names[i]);
        this.gameData.pairings[secondChosenPrompt].push(this.playerList.names[i]);

        player.clientData.qPrompts.push(
            { promptId: firstChosenPrompt, promptText: prompts[firstChosenPrompt] },
            { promptId: secondChosenPrompt, promptText: prompts[secondChosenPrompt] }
        );
    }

    startVoting() {
        this.gameData.gameState = QuailGameState.VOTING;

        // send all players the voting matchups
        for (let i = 0; i < this.playerList.names.length; i++) {

            const player = this.playerList.objs[i];

            // TODO why does this get called 3x per vote?
            player.socket.once('qVote', (promptId: string, chosenIndex: number, colorIndex, ack) => {

                // verify voter eligibility ;)
                if (this.gameData.pairings[promptId].includes(player.name)) {
                    console.warn(player.name + ' attempted to vote on their own prompt');
                    return;
                }

                player.clientData.qMyVotes[promptId] = chosenIndex;
                this.gameData.qPromptAnswers[promptId][chosenIndex].votes ||= [];

                const votes: QVote[] = this.gameData.qPromptAnswers[promptId][chosenIndex].votes;
                if (!votes.find((v: QVote) => v.playerName == player.name)) {
                    votes.push({ playerName: player.name, colorIndex: colorIndex });
                }

                ack(player.clientData);
                this.informHost();

                if (!this.gameData.qPromptAnswers[promptId].find((o) => { return o.finished })) {
                    if (this.isVotingFinished(promptId)) {
                        // NEXT ROUND
                        this.gameData.qPromptAnswers[promptId].push({ finished: 'voted' });

                        this.host.socket.once('qNextBallot', () => {
                            const len = this.gameData.qPromptAnswers[promptId].length;
                            this.gameData.qPromptAnswers[promptId][len - 1].finished = 'tallied';

                            if (this.isAllVotingFinished()) {
                                this.startVoting();
                            } else {
                                if (this.gameData.roundNumber < 3) {
                                    this.gameData.roundNumber += 1;
                                }
                                this.showLeaderboard();
                            }
                        });

                        this.informHost();
                    }
                }
            });
            // player.clientData.qPromptAnswers = this.gameData.qPromptAnswers;
            player.inform(this.gameData);
        }
        this.informHost();
    }

    isVotingFinished(promptId): boolean {
        const totalVotesExpected: number = this.playerList.names.length - 2;

        const votesForFirst = this.gameData.qPromptAnswers[promptId][0].votes?.length || 0;
        const votesForSecond = this.gameData.qPromptAnswers[promptId][1].votes?.length || 0;

        if (votesForFirst + votesForSecond >= totalVotesExpected) {

            let firstPlayerName;
            let secondPlayerName;

            try {
                firstPlayerName = this.gameData.pairings[promptId][0];
                secondPlayerName = this.gameData.pairings[promptId][1];
            } catch (e) {
                console.error('gd', this.gameData);
                throw Error('error on ' + promptId);
            }

            if (votesForFirst > votesForSecond) {
                this.gameData.scores[firstPlayerName] += 50;
            } else if (votesForFirst < votesForSecond) {
                this.gameData.scores[secondPlayerName] += 50;
            } else {
                this.gameData.scores[firstPlayerName] += 20;
                this.gameData.scores[secondPlayerName] += 20;
            }
            return true;
        }
        return false;
    }

    isAllVotingFinished() {
        const vals = Object.values(this.gameData.qPromptAnswers);
        return vals.find((p: QpaData[]) => {
            return !(p.find((d: QpaData) => {
                return d.finished == 'tallied'
            }));
        });
    }

    showLeaderboard() {
        this.gameData.gameState = QuailGameState.LEADERBOARD;

        this.host.socket.once('startRound', (callback) => {
            this.startRound().then(callback)
        });

        this.informHost();
        this.informAllPlayers();
    }

    createPlayer(socket, name, uid): QuailPlayer {
        return new QuailPlayer(socket, name, uid, this.gameData.roomCode);
    }

    createHost(hostSocket, uid, gameId): QuailHost {
        return new QuailHost(hostSocket, uid, gameId, this.gameData);
    }
}