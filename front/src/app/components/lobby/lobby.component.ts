import { AfterViewInit, Component } from '@angular/core';
import { Router } from '@angular/router';
import { SocketioService } from 'src/app/services/socketio.service';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent implements AfterViewInit {

  numPlayers: number = 0;
  hostName: string = window.location.hostname;
  bootingPlayer?: string;

  constructor(private router: Router, public sio: SocketioService) { }

  ngAfterViewInit(): void {
    this.sio.onceRegistered().then(() => {
      this.createGame();
    });
  }

  createGame() {
    this.sio.getSocket().then((sock) => {
      // if game not already created
      console.log(this.sio.gameData);

      if (!this.sio.gameData?.public?.base?.roomCode) {
        // request 'createGame' to server
        sock.timeout(5000).emit('createGame', this.sio.uid, null, (err) => {
          if (err) {
            console.log('createGame failed', err);
          }
        });
      }
    });
  }

  startGame() {
    this.router.navigate(['/answering']);
  }

  bootPlayer(name: string) {
    this.bootingPlayer = name;
    this.sio.emitTimeout(2000, 'bootPlayer', name, (err)=>{
      if (err) {
        this.bootingPlayer = '';
      }
    });
  }

  hasEnoughPlayers() {
    const b = this.sio.gameData?.playerNames && (this.sio.gameData?.playerNames!.length >= 3);
    if (b) {
      this.debug();
      return true;
    }
    return false;
  }

  debug() {
    if (this.sio.DEBUG) {
      setTimeout(() => {
        this.startGame();
      }, 500);
    }
    return true;
  }
}
