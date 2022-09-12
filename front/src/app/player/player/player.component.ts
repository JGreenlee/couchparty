import { AfterViewInit, Component, DoCheck, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { SocketioService } from 'src/app/services/socketio.service';
import * as util from '../../services/util';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
})

export class PlayerComponent implements OnInit, DoCheck, AfterViewInit {

  @ViewChild('bootedDialog')
  bootedDialog!: ElementRef;
  currentSlideComponent!: any;

  constructor(public sio: SocketioService, public metaService: Meta, public router: Router) { }

  ngOnInit() {
    this.sio.getSocket().then((sock) => {
      sock.on('sioPerform', (cmd: string, ...params) => {
        this[cmd](params);
        this.currentSlideComponent[cmd](params);
      });
    });
    this.sio.onceRegistered().then(()=>{
      if (!this.sio.playerData) {
        this.sio.disableAnimations = false;
        this.router.navigate(['/play']);
      }
    });
  }

  @HostListener("window:resize", ['event'])
  ngAfterViewInit(): void {
    util.calculateScale(400, 1200, 600, 1000);
  }

  updateDarkMode(e) {
    if (e.target.checked) {
      document.documentElement.classList.remove('theme--default');
      document.documentElement.classList.add('theme--dark');
      localStorage.setItem('qTheme', 'dark');
    } else {
      document.documentElement.classList.remove('theme--dark');
      document.documentElement.classList.add('theme--default');
      localStorage.setItem('qTheme', 'default');
    }
  }

  onBooted(o) {
    this.bootedDialog.nativeElement.style.display = 'flex';
  }

  getConnStatus() {
    let r = '';

    if (this.sio.gameData?.public?.base?.roomCode || this.sio.playerData?.public?.base?.roomCode) {
      r += 'Connected to game ' + (this.sio.gameData?.public?.base?.roomCode || this.sio.playerData?.public?.base?.roomCode) + ' ✅';
    } else if (this.sio.isConnected()) {
      r += 'Connected, not joined in any game yet... ⌛';
    } else {
      r += 'Not connected ❌'
    }

    r += "\n\n";

    if (this.sio.uid) {
      r += 'UID: ' + this.sio.uid + '\xa0✅';
    } else {
      r += 'UID not registered ❌'
    }

    // latency?

    return r;
  }

  ngDoCheck(): void {
    // this.sio.doCheck();
  }

}
