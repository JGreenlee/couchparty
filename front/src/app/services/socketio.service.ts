import { DoCheck, Injectable, KeyValueChanges, KeyValueDiffer, KeyValueDiffers, OnChanges } from '@angular/core';
import { Router } from '@angular/router';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { QuailGameState } from '../../../../back/src/Games/Quail/QuailGame';

import { QuailGameData } from '../../../../back/src/Games/Quail/QuailGameData'
import { QuailPlayerData } from '../../../../back/src/Games/Quail/QuailPlayer'
import { getCurrentPromptIndex } from './util';

// type QuailPlayerData = any;
// type QuailGameData = any;

@Injectable({
  providedIn: 'root'
})
export class SocketioService {

  public DEBUG = true;

  private socket?: Socket;
  playerData?: QuailPlayerData;
  gameData?: QuailGameData;
  uid?: string;
  private gdDiffer?: KeyValueDiffer<string, any>;

  constructor(private differs: KeyValueDiffers, public router: Router) { }

  async getSocket(): Promise<Socket> {
    if (!this.socket) {
      this.socket = io(environment.SOCKET_ENDPOINT);
    }

    return this.socket;
  }

  connect(asHost: boolean) {
    
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;

    if (!this.socket) {
      this.getSocket().then((sock: Socket) => {
        sock.emit('register', window.localStorage.getItem('quailUserId'), (uid, gameData?) => {
          window.localStorage.setItem('quailUserId', uid);
          this.uid = uid;
          if (gameData) {
            this.updateMyGameData(gameData);
          } else {
            this.router.navigate([asHost ? '/lobby' : '/play']);
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
  isRegistered(): boolean { return this.gameData != null; }

  updateMyGameData(gd: QuailGameData) {
    console.debug('updateMyGameData', gd);

    if (gd != null) {
      this.gameData = gd;
      if (!this.gdDiffer) {
        this.gdDiffer = this.differs.find(this.gameData).create();
      }

      switch (gd.gameState) {
        case QuailGameState.ANSWERING:
          this.router.navigate(['/answering']);
          break;
        case QuailGameState.VOTING:
          const i = getCurrentPromptIndex(gd.qPromptAnswers, Object.keys(gd.qPromptAnswers));
          this.router.navigate(['/voting/'+i]);
          break;
        case QuailGameState.LEADERBOARD:
          this.router.navigate(['/scores']);
          break;
      }
    }
  }

  updateMyPlayerData(pd: QuailPlayerData) {
    console.debug('updateMyPlayerData', pd);

    if (pd != null) {
      this.playerData = pd;

      switch (pd.gameState) {
        case QuailGameState.ANSWERING:
          this.router.navigate(['/quiz']);
          break;
        case QuailGameState.VOTING:
          const i = getCurrentPromptIndex(pd.qVotingMatchups!, Object.keys(pd.qVotingMatchups!));
          this.router.navigate(['/ballot/'+i]);
          break;
        case QuailGameState.LEADERBOARD:
          this.router.navigate(['/rank']);
          break;
      }
    }
  }

  emit(e: string, ...args: any[]) {
    if (this.socket?.connected) {
      return this.socket.emit(e, ...args) != null;
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