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

  constructor(private router: Router, public sio : SocketioService) { }

  ngAfterViewInit(): void {
    this.sio.getSocket().then((sock) => {
      sock.emit('createGame', 'quail', null, this.sio.updateMyGameData);
    });
  }

  startGame() {
    this.router.navigate(['/answering']);
  }

  bootPlayer(name : string) {
    this.sio.emit('bootPlayer', name);
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
