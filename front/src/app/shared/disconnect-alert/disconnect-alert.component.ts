import { Component, Input } from '@angular/core';
import { SocketioService } from 'src/app/services/socketio.service';

@Component({
  selector: 'app-disconnect-alert',
  templateUrl: './disconnect-alert.component.html',
  styleUrls: ['./disconnect-alert.component.scss'],
})
export class DisconnectAlertComponent {

  Date = Date;
  secondsLeft? : number;

  constructor(public sio : SocketioService) {
    setInterval(() => {
      this.secondsLeft = Math.floor((this.sio.playerData?.public?.base?.hostDisconnected! - Date.now()) / 1000)
    }, 1000);
  }
}
