import { AfterViewInit, Component, DoCheck, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { slider, stepper } from 'src/app/route-animations';
import { SocketioService } from 'src/app/services/socketio.service';
import { QuailGameState } from '../../../../../back/src/Games/Quail/QuailGame';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
  animations: [slider, stepper]
})
export class PlayerComponent implements OnInit, DoCheck {

  @ViewChild('bootedDialog')
  bootedDialog!: ElementRef;
  currentSlideComponent!: any;

  constructor(public sio: SocketioService, public metaService: Meta, public router: Router) { }

  ngOnInit() {
    this.sio.connect(false); // connect not asHost
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
    const targetHeight = 500;
    const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
    const scaleFactor = vh / targetHeight;
    const isBigEnough = vh > targetHeight || scaleFactor >= 1
    document.documentElement.style.fontSize = isBigEnough ? '' : (118 * scaleFactor) + '%';
  }

  public onRouterOutletActivate(event: any) {
    this.currentSlideComponent = event;
  }

  updateDarkMode(e) {
    if (e.target.checked) {
      document.documentElement.classList.remove('theme--default');
      document.documentElement.classList.add('theme--dark');
      localStorage.setItem('quailTheme', 'dark');
    } else {
      document.documentElement.classList.remove('theme--dark');
      document.documentElement.classList.add('theme--default');
      localStorage.setItem('quailTheme', 'default');
    }
  }

  onBooted(o) {
    this.bootedDialog.nativeElement.style.display = 'flex';
  }

  ngDoCheck(): void {
    // this.sio.doCheck();
  }

}
