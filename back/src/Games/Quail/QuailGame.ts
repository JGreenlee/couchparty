import { Game } from '../../Game';
import { PlayerList } from '../../PlayerList';
import { QpaData, QuailGameData, QVote } from './QuailGameData';
import { QuailHost, QuailPlayer } from "./QuailPlayer";
import prompts from './prompts.json';
import * as util from '../../util/util';
import { Socket } from 'socket.io';

export const GAME_TYPE_NAME_QUAIL: string = 'quail';

export interface QuailGameOptions {
    maxPlayers: number,
    promptPacks: string[],
    redHerrings: boolean
}

export type QuailGameState =
      'INTRO'           // tutorial
    | 'ANSWERING'       // prompts have been sent, waiting for players' answers
    | 'VOTING'          // answers received, voting has begun
    | 'LEADERBOARD'     // viewing scores
;

export class QuailGame extends Game {

    gameTypeName: string;
    gameOptions: QuailGameOptions;
    gameData: QuailGameData;

    playerList: PlayerList<QuailPlayer>;

    constructor(hostSocket: Socket, hostUid: string, roomCode: string, gameOptions: QuailGameOptions) {
        const gd = new QuailGameData({
            public: {
                roundNumber: 0,
                base: {
                    roomCode: roomCode,
                    scores: {},
                    gameState: 'LOBBY',
                    hostDisconnected: 0
                }
            }
        });
        super(hostSocket, hostUid, roomCode, gd);
        this.gameData = gd;
        this.gameOptions = gameOptions;
        this.gameTypeName = GAME_TYPE_NAME_QUAIL;
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
            p.playerData.qMyVotes = {};
            p.playerData.qPrompts = [];
            p.playerData.qPromptAnswers = this.gameData.qPromptAnswers;
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
        this.gameData.public.base.gameState = 'ANSWERING';

        const promptsArr = Object.keys(prompts);
        const numOfPrompts = this.playerList.names.length;
        const randPrompts = util.getRandFrom(promptsArr, numOfPrompts);

        for (let i = 0; i < numOfPrompts; i++) {

            const player = this.playerList.objs[i];

            // assign prompts to player
            this.assignPrompts(player, i, numOfPrompts, randPrompts)

            // what to do when answers come in
            player.socket.on('qAnswers', (r: { promptId: string; promptAnswer: any; }[], ack) => {
                player.socket.removeAllListeners('qAnswers');
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

        player.playerData.qPrompts.push(
            { promptId: firstChosenPrompt, promptText: prompts[firstChosenPrompt] },
            { promptId: secondChosenPrompt, promptText: prompts[secondChosenPrompt] }
        );
    }

    startVoting() {
        this.gameData.public.base.gameState = 'VOTING';

        // send all players the voting matchups
        for (let i = 0; i < this.playerList.names.length; i++) {

            const player = this.playerList.objs[i];

            // TODO why does this get called 3x per vote?
            player.socket.on('qVote', (promptId: string, chosenIndex: number, colorIndex, ack) => {
                player.socket.removeAllListeners('qVote');

                // verify voter eligibility ;)
                if (this.gameData.pairings[promptId].includes(player.name)) {
                    console.warn(player.name + ' attempted to vote on their own prompt');
                    return;
                }

                player.playerData.qMyVotes[promptId] = chosenIndex;
                this.gameData.qPromptAnswers[promptId][chosenIndex].votes ||= [];

                const votes: QVote[] = this.gameData.qPromptAnswers[promptId][chosenIndex].votes;
                if (!votes.find((v: QVote) => v.playerName == player.name)) {
                    votes.push({ playerName: player.name, colorIndex: colorIndex });
                }

                ack(player.playerData);
                this.informHost();

                if (!this.gameData.qPromptAnswers[promptId].find((o) => { return o.finished })) {
                    if (this.isVotingFinished(promptId)) {
                        // NEXT ROUND
                        this.gameData.qPromptAnswers[promptId].push({ finished: 'voted' });

                        this.host.socket.on('qNextBallot', () => {

                            this.host.socket.removeAllListeners('qNextBallot');
                            const len = this.gameData.qPromptAnswers[promptId].length;
                            this.gameData.qPromptAnswers[promptId][len - 1].finished = 'tallied';

                            if (this.isAllVotingFinished()) {
                                this.startVoting();
                            } else {
                                if (this.gameData.public.roundNumber < 3) {
                                    this.gameData.public.roundNumber += 1;
                                    this.showLeaderboard();
                                } else {
                                    this.showLeaderboard();
                                    this.onFinished(this);
                                }
                            }
                        });
                        this.informHost();
                    }
                }
            });
            // player.playerData.qPromptAnswers = this.gameData.qPromptAnswers;
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
                this.gameData.public.base.scores[firstPlayerName] += 50;
            } else if (votesForFirst < votesForSecond) {
                this.gameData.public.base.scores[secondPlayerName] += 50;
            } else {
                this.gameData.public.base.scores[firstPlayerName] += 20;
                this.gameData.public.base.scores[secondPlayerName] += 20;
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
        this.gameData.public.base.gameState = 'LEADERBOARD';

        this.host.socket.on('startRound', (callback) => {
            this.host.socket.removeAllListeners('startRound');
            this.startRound().then(callback)
        });

        this.informHost();
        this.informAllPlayers();
    }

    createPlayer(playerSocket: Socket, playerUid: string, roomCode: string, playerName: string): QuailPlayer {
        return new QuailPlayer(playerSocket, playerUid, roomCode, this.gameData.public, playerName);
    }

    createHost(hostSocket: Socket, hostUid: string, roomCode: string, gameData: QuailGameData): QuailHost {
        return new QuailHost(hostSocket, hostUid, roomCode, gameData.public);
    }
}