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

  constructor(private router: Router, public sio : SocketioService) { }

  ngAfterViewInit(): void {
    this.sio.getSocket().then((sock) => {
      sock.timeout(5000).emit('createGame', null, (err)=>{
        if (err) {
          console.log('createGame failed', err);
        }
      });
    });
  }

  startGame() {
    this.router.navigate(['/answering']);
  }

  bootPlayer(name : string) {
    this.sio.emit('bootPlayer', name);
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
      setTimeout(()=>{
        this.startGame();
      }, 500);
    }
    return true;
  }
}
