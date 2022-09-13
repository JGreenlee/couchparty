import { Component, OnInit, AfterViewInit, HostListener, DoCheck } from '@angular/core';
import { Router } from '@angular/router';
import { SocketioService } from '../../services/socketio.service';
import * as util from '../../services/util'

@Component({
  selector: 'app-host',
  templateUrl: './host.component.html',
  styleUrls: ['./host.component.scss']
})
export class HostComponent implements OnInit, AfterViewInit, DoCheck {

  currentSlideComponent!: any;
  askEndGame: string = '';

  constructor(public sio: SocketioService, private router: Router) { }

  ngOnInit(): void {
    this.sio.getSocket().then((sock) => {
      sock.on('sioPerform', (cmd: string, ...params) => {
        this[cmd](params);
        this.currentSlideComponent[cmd](params);
      });
    });
    this.sio.onceRegistered().then(() => {
      if (!this.sio.gameData) {
        this.sio.disableAnimations = false;
        this.router.navigate(['/lobby']);
      }
    });
  }

  ngAfterViewInit(): void {
    util.constrainViewport(1100, 1400, 600, 1000);
    util.calculateScale();
  }

  @HostListener('document:keydown', ['$event'])
  keypress(event: KeyboardEvent) {
    if (event.key == "Escape" && this.sio.gameData?.public?.base?.roomCode) {
      this.askEndGame = 'ask';
    }
  }

  endGame(): void {
    this.sio.emit('terminateGame', (success) => {
      if (success) {
        delete this.sio.gameData;
        this.askEndGame = '';
        this.router.navigate(['/']);
      } else {
        //
      }
    });
  }

  ngDoCheck(): void {
    this.sio.doCheck();
  }
}