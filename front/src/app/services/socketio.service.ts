import { Injectable, KeyValueChanges, KeyValueDiffer, KeyValueDiffers, OnChanges } from '@angular/core';
import { Router } from '@angular/router';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { GameData } from '../../../../back/src/Game';

import { QuailGameState } from '../../../../back/src/Games/Quail/QuailGame';
import { QuailGameData } from '../../../../back/src/Games/Quail/QuailGameData';
import { QuailPlayerData } from '../../../../back/src/Games/Quail/QuailPlayer';
import { PlayerData } from '../../../../back/src/Player';

import { getCurrentPromptIndex } from './util';

// type QuailPlayerData = any;
// type QuailGameData = any;

@Injectable({
  providedIn: 'root'
})
export class SocketioService {

  public DEBUG = environment.DEBUG;

  private socket?: Socket;
  playerData?: QuailPlayerData;
  gameData?: QuailGameData;
  uid?: string;
  private gdDiffer?: KeyValueDiffer<string, any>;

  constructor(private differs: KeyValueDiffers, public router: Router) { }

  async getSocket(): Promise<Socket> {
    if (!this.socket) {
      if (environment.production) {
        this.socket = io();
      } else {
        this.socket = io(environment.SOCKET_PORT);
      }
    }

    return this.socket;
  }

  connect(asHost: boolean) {

    if (!this.socket) {
      this.getSocket().then((sock: Socket) => {

        const rcData = JSON.parse(window.localStorage.getItem('qRoomCode') || '{}');
        let rRoomCode;
        // only remember roomCode if it was from within the last 15 minutes
        if (rcData && new Date().getTime() < rcData['timestamp'] + 900000) {
          rRoomCode = rcData['roomCode'] || undefined;
        }
        const rUid = window.localStorage.getItem('qUserId') || undefined;

        const rememberedData = {
          uid: rUid || '',
          roomCode: rRoomCode || ''
        }

        console.log('remembered', rememberedData);

        sock.emit('register', rememberedData, (uid, clientData) => {
          window.localStorage.setItem('qUserId', uid);
          this.uid = uid;

          if (clientData) {
            if (clientData.isGameData) {
              this.updateMyGameData(clientData);
            } else if (clientData.isPlayerData) {
              this.updateMyPlayerData(clientData);
            }
          } else {
            this.router.navigate([asHost ? '/' : '/play']);
          }
        });

        if (asHost) {
          sock.on('gameData', (gd: QuailGameData) => {
            this.updateMyGameData(gd);
          });
        } else {
          sock.on('playerData', (pd: QuailPlayerData) => {
            this.updateMyPlayerData(pd);
          });
        }
      });
    }
  }


  isConnected(): boolean { return this.socket != undefined && this.socket.connected; }
  isRegistered(): boolean { return (this.gameData || this.playerData) != null; }

  updateMyGameData(gd: QuailGameData) {
    Promise.resolve(null).then(() => {
      console.debug('updateMyGameData', gd);
      if (gd) {
        this.gameData = gd;
        // if (!this.gdDiffer) {
        //   this.gdDiffer = this.differs.find(this.gameData).create();
        // }
        if (gd.roomCode) {
          const rcData = { roomCode: gd.roomCode, timestamp: new Date().getTime() }
          window.localStorage.setItem('qRoomCode', JSON.stringify(rcData));
        }
        switch (gd.gameState) {
          case QuailGameState.ANSWERING:
            this.router.navigate(['/answering']);
            break;
          case QuailGameState.VOTING:
            const i = getCurrentPromptIndex(gd.qPromptAnswers, Object.keys(gd.qPromptAnswers));
            this.router.navigate(['/voting/' + i]);
            break;
          case QuailGameState.LEADERBOARD:
            this.router.navigate(['/scores']);
            break;
        }
      }
    });
  }

  updateMyPlayerData(pd: QuailPlayerData) {
    Promise.resolve(null).then(() => {
      console.debug('updateMyPlayerData', pd);
      if (pd) {
        this.playerData = pd;
        if (pd.roomCode) {
          const rcData = { roomCode: pd.roomCode, timestamp: new Date().getTime() }
          window.localStorage.setItem('qRoomCode', JSON.stringify(rcData));
        }
        switch (pd.gameState) {
          case QuailGameState.ANSWERING:
            this.router.navigate(['/quiz']);
            break;
          case QuailGameState.VOTING:
            const i = getCurrentPromptIndex(pd.qPromptAnswers!, Object.keys(pd.qPromptAnswers!));
            this.router.navigate(['/ballot/' + i]);
            break;
          case QuailGameState.LEADERBOARD:
            this.router.navigate(['/rank']);
            break;
        }
      }
    });
  }

  emit(e: string, ...args: any[]) {
    if (this.socket?.connected) {
      return this.socket.emit(e, ...args) != null;
    } else {
      return false;
    }
  }

  emitTimeout(timeout: number, e: string, ...args: any[]) {
    if (this.socket?.connected) {
      return this.socket.timeout(timeout).emit(e, ...args) != null;
    } else {
      return false;
    }
  }

  doCheck(): void {
    if (this.gameData && this.gdDiffer) {
      const changes = this.gdDiffer.diff(this.gameData);
      if (changes) {
        this.gdChanged(changes);
      }
    }
  }

  private gdChanged(changes: KeyValueChanges<string, any>) {
    // changes.forEachAddedItem((record) => console.log(record));
    // changes.forEachChangedItem((record) => console.log(record));
  }
}