import { AfterViewInit, Component, OnInit } from '@angular/core';
import { SocketioService } from 'src/app/services/socketio.service';

@Component({
  selector: 'app-socket-status',
  template: `
    <div class="socketStatus has-tooltip-arrow has-tooltip-right has-tooltip-multiline fade-in-1s"
      [attr.data-tooltip]="getConnStatus()">
      <i class="button transition-200ms"
          [ngClass]="!sio.isConnected()?'is-tertiary':sio.isRegistered()?'is-primary':'is-dark'">
          <i class="fa fa-solid" [ngClass]="sio.isConnected()?'fa-wifi':'fa-spin fa-circle-notch'"></i>
      </i>
    </div>
  `,
  styles: [`

    .socketStatus {
      position: fixed;
      left: -0.4rem;
      top: 0.3rem;
    }

    .socketStatus > .button {
      border-radius: 0 50% 50% 0 !important;
      background-color: rgba(100,100,100, .7);
      width: 2.5rem;
      height: 2.5rem;
      font-size: 1.2rem;
    }

    .socketStatus::before {
      white-space: pre-line !important;
      transform: translateX(100%) translateY(100%) translateY(-1.2rem) !important;
      font-family: 'Dosis';
      text-align: center;
      width: max-content !important;
    }

    .socketStatus .fa {
      transform: translateX(0.15rem);
      animation-duration: 1s;
      animation-iteration-count: infinite;
    }

  `]
})
export class SocketStatusComponent implements AfterViewInit {

  latencyAvg?: number;
  latencyAvgCount: number = 5;
  latencyArr: number[] = [];

  constructor(public sio: SocketioService) { }

  ngAfterViewInit(): void {
    setInterval(this.updateAvgLatency, 5000);
  }

  // getQLatency(): Promise<number> {
  //   return new Promise((res, rej) => {
  //     const d = new Date();
  //     const oldTime = d.getTime();
  //     this.sio.emit('qClientPing', () => {
  //       res(d.getTime() - oldTime);
  //     });
  //   });
  // }

  qLatency() {
    return 0;
  }

  // TODO fix latency polling
  updateAvgLatency() {
    // console.log(this.qLatency());
    
    // this.getQLatency().then((late: number) => {
    //   this.latencyArr.push(late);
    // });
    // if (this.latencyArr.length > 30) {
    //   this.latencyArr = this.latencyArr.slice(-this.latencyAvgCount);
    // }
    // this.latencyAvg = this.latencyArr.slice(-this.latencyAvgCount).reduce((a, b) => a + b) / this.latencyAvgCount;
    // console.log(this.latencyAvg);
  }

  getConnStatus() {
    let r = '';

    if (this.sio.gameData?.roomCode != null) {
      r += 'Connected to game ' + this.sio.gameData?.roomCode + ' ✅';
    } else if (this.sio.isConnected()) {
      r += 'Not joined in any game yet... ⌛';
    } else {
      r += 'Not connected ❌'
    }

    r += "\n\n";

    if (this.sio.uid) {
      r += 'Registered UID: ' + this.sio.uid + ' ✅';
    } else {
      r += 'UID not registered ❌'
    }

    if (this.latencyAvg) {
      r += '\n\nAvg latency: ' + this.latencyAvg;
    }

    return r;
  }
}
