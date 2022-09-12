import { Injectable, KeyValueChanges, KeyValueDiffer, KeyValueDiffers } from '@angular/core';
import { Router } from '@angular/router';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { GameState } from '../../../../back/src/GameData';

import type { QuailGameData } from '../../../../back/src/Games/Quail/QuailGameData';
import type { QuailPlayerData } from '../../../../back/src/Games/Quail/QuailPlayer';

import { getCurrentPromptIndex } from './util';

// type QuailPlayerData = any;
// type QuailGameData = any;

@Injectable({
  providedIn: 'root'
})
export class SocketioService {

  public DEBUG = environment.DEBUG;
  public disableAnimations = true;

  private socket?: Socket;
  playerData?: QuailPlayerData;
  gameData?: QuailGameData;
  uid?: string;
  onceRegisteredPromise;
  private gdDiffer?: KeyValueDiffer<string, any>;
  disconnected: boolean = false;
  disconnectedMessage: string = '';

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

  async onceRegistered(): Promise<boolean> {
    if (this.isRegistered()) {
      return true;
    }
    return new Promise<boolean>(res => this.onceRegisteredPromise = res);
  }

  register() {

    if (!this.socket) {
      this.getSocket().then((sock: Socket) => {

        // attach listeners
        sock.on('gameData', (gd: QuailGameData) => {
          this.updateMyGameData(gd);
        });
        sock.on('playerData', (pd: QuailPlayerData) => {
          this.updateMyPlayerData(pd);
        });

        // see what we can remember from localStorage
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

        // register
        console.log('registering with remembered', rememberedData);
        sock.emit('register', rememberedData, (uid: string, rememberedClientData: QuailGameData | QuailPlayerData) => {

          if (uid) {
            window.localStorage.setItem('qUserId', uid);
            this.uid = uid;

            if (rememberedClientData) {
              this.disableAnimations = false;
              if (rememberedClientData.hasOwnProperty('isGameData')) {
                this.updateMyGameData(rememberedClientData as QuailGameData);
              } else if (rememberedClientData.hasOwnProperty('isPlayerData')) {
                this.updateMyPlayerData(rememberedClientData as QuailPlayerData);
              } else {
                console.log('rememberedClientData did not appear to be either gd or pd');
              }
            }
            if (this.onceRegisteredPromise) {
              this.onceRegisteredPromise(true);
            }
          } else {
            alert('It looks like you are already connected in another tab. If this is not the case, clear your cookies and try again.');
          }
        });
        sock.on("reconnect", () => {
          this.disconnected = false;
        });
        sock.on("disconnect", () => {
          this.disconnected = true;
        });
      });
    }
  }

  isConnected(): boolean { return this.socket != undefined && this.socket.connected; }
  isRegistered(): boolean { return this.uid != undefined }
  isJoined(): boolean { return (this.gameData || this.playerData) != null; }

  updateMyGameData(gd: QuailGameData) {
    Promise.resolve(null).then(() => {
      console.debug('updateMyGameData', gd);
      if (gd) {
        this.gameData = gd;
        // if (!this.gdDiffer) {
        //   this.gdDiffer = this.differs.find(this.gameData).create();
        // }
        if (gd.public.base.roomCode) {
          const rcData = { roomCode: gd.public.base.roomCode, timestamp: new Date().getTime() }
          window.localStorage.setItem('qRoomCode', JSON.stringify(rcData));
        }
        switch (gd.public.base.gameState) {
          case 'LOBBY':
            this.router.navigate(['/lobby']);
            break;
          case 'ANSWERING':
            this.router.navigate(['/answering']);
            break;
          case 'VOTING':
            const i = getCurrentPromptIndex(gd.qPromptAnswers, Object.keys(gd.qPromptAnswers));
            this.router.navigate(['/voting/' + i]);
            break;
          case 'LEADERBOARD':
            this.router.navigate(['/scores']);
            break;
          case 'TERMINATED':
            delete this.gameData;
            this.router.navigate(['/']);
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
        if (pd.public.base.roomCode) {
          const rcData = { roomCode: pd.public.base.roomCode, timestamp: new Date().getTime() }
          window.localStorage.setItem('qRoomCode', JSON.stringify(rcData));
        }
        switch (pd.public.base.gameState) {
          case 'LOBBY':
            this.router.navigate(['/play']);
            break;
          case 'ANSWERING':
            this.router.navigate(['/quiz']);
            break;
          case 'VOTING':
            const i = getCurrentPromptIndex(pd.qPromptAnswers!, Object.keys(pd.qPromptAnswers!));
            this.router.navigate(['/ballot/' + i]);
            break;
          case 'LEADERBOARD':
            this.router.navigate(['/rank']);
            break;
          case 'TERMINATED':
            delete this.playerData;
            this.router.navigate(['/play']);
            break;
        }
      }
    });
  }

  clientData() {
    return this.playerData || this.gameData;
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