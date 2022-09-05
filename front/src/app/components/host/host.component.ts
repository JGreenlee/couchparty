import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, HostListener, DoCheck } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { slider, stepper } from '../../route-animations';
import { SocketioService } from '../../services/socketio.service';

@Component({
  selector: 'app-host',
  templateUrl: './host.component.html',
  styleUrls: ['./host.component.scss'],
  animations: [slider, stepper]
})
export class HostComponent implements OnInit, AfterViewInit, DoCheck {

  isFullscreen: boolean = false;
  currentSlideComponent!: any;

  constructor(private metaService: Meta, public sio: SocketioService) { }

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
    const targetWidth = 1000;
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
    const scaleFactor = vw / targetWidth;
    const isBigEnough = vw > targetWidth || scaleFactor >= 1
    document.documentElement.style.fontSize = isBigEnough ? '' : (118 * scaleFactor) + '%';
  }

  @HostListener('document:fullscreenchange', ['$event'])
  updateFullsceenSwitch() {
    this.isFullscreen = document.fullscreenElement != null;
  }

  applyFullscreenStatus(e) {
    if (e?.target?.checked) {
      document.documentElement.requestFullscreen().catch((err) => console.error(err));
    } else {
      document.exitFullscreen().catch((err) => console.error(err));
    }
  }

  applyDarkModeStatus(e) {
    if (e?.target?.checked) {
      document.documentElement.classList.remove('theme--default');
      document.documentElement.classList.add('theme--dark');
      localStorage.setItem('quailTheme', 'dark');
    } else {
      document.documentElement.classList.remove('theme--dark');
      document.documentElement.classList.add('theme--default');
      localStorage.setItem('quailTheme', 'light');
    }
  }

  isDarkMode(): boolean {
    return document.documentElement.classList.contains('theme--dark');
  }

  public onRouterOutletActivate(event: any) {
    this.currentSlideComponent = event;
  }

  ngDoCheck(): void {
    this.sio.doCheck();
  }
}