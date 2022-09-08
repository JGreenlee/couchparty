import { Component, OnInit, AfterViewInit, HostListener, DoCheck } from '@angular/core';
import { SocketioService } from '../../services/socketio.service';

@Component({
  selector: 'app-host',
  templateUrl: './host.component.html'
})
export class HostComponent implements OnInit, AfterViewInit, DoCheck {

  currentSlideComponent!: any;

  constructor(public sio: SocketioService) { }

  ngOnInit(): void {
    this.sio.connect(true); // connect asHost

    this.sio.getSocket().then((sock) => {
      sock.on('sioPerform', (cmd: string, ...params) => {
        this[cmd](params);
        this.currentSlideComponent[cmd](params);
      });
    });
  }

  ngAfterViewInit(): void {
    this.calculateScale();
  }

  @HostListener("window:resize", ['event'])
  calculateScale() {
    const minWidth = 1000, maxWidth = 1400;
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    if (vw < minWidth) {
      const scaleFactor = vw / minWidth;
      document.documentElement.style.fontSize = 118 * scaleFactor + '%';
    } else if (vw > maxWidth) {
      const scaleFactor = vw / maxWidth;
      document.documentElement.style.fontSize = 118 * scaleFactor + '%';
    }
  }

  ngDoCheck(): void {
    this.sio.doCheck();
  }
}