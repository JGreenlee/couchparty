import { Component, OnInit, AfterViewInit, HostListener, DoCheck } from '@angular/core';
import { SocketioService } from '../../services/socketio.service';
import * as util from '../../services/util'

@Component({
  selector: 'app-host',
  templateUrl: './host.component.html',
  styleUrls: ['./host.component.scss']
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

  @HostListener("window:resize", ['event'])
  ngAfterViewInit(): void {
    util.calculateScale(1000, 1400, 600, 1000);
  }
  
  ngDoCheck(): void {
    this.sio.doCheck();
  }
}