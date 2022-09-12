import { trigger } from '@angular/animations';
import { AfterViewInit, Component, HostListener, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { blockOnRender, slide } from './route-animations';
import { SocketioService } from './services/socketio.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  animations: [trigger('animSlide', slide), trigger('animBlockOnRender', blockOnRender)]
})
export class AppComponent implements OnInit, AfterViewInit {

  constructor(public sio: SocketioService) {
    const bc = new BroadcastChannel("couch-party-games");
    bc.onmessage = (e) => {
      if (e.data == 'checkDuplicate') {
        bc.postMessage('notifyDuplicate');
      }
      if (e.data == 'notifyDuplicate') {
        bc.close();
        this.sio.getSocket().then((sock) => {
          sock.disconnect();
          console.log('idosconnectu');
          
          sio.disconnected = true;
          sio.disconnectedMessage = 'The game is already open in another tab.\n\nYou may close this tab.';
        });
      }
    };
    bc.postMessage('checkDuplicate');
  }

  ngOnInit(): void {
    this.sio.register();
  }

  ngAfterViewInit() {
    this.applyCorrectTheme();
    setTimeout(() => {
      this.sio.disableAnimations = false;
      document.documentElement.style.transition = 'font-size .15s';
    }, 300);
  }

  childAnimData(routerOutlet: RouterOutlet) {
    if (routerOutlet.isActivated) {

      return routerOutlet?.activatedRoute?.snapshot?.data['anim']
        || routerOutlet?.activatedRoute?.firstChild?.snapshot?.data['anim']
        || routerOutlet?.activatedRoute?.firstChild?.firstChild?.snapshot?.data['anim']
        || null;
    }
    return undefined;
  }

  @HostListener('window:storage', ['$event'])
  applyCorrectTheme() {
    let storedTheme = localStorage.getItem('qTheme');
    let systemIsDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (storedTheme && storedTheme == 'dark' || !storedTheme && systemIsDark) {
      document.documentElement.classList.add('theme--dark');
      document.documentElement.classList.remove('theme--default');
    } else if (storedTheme && storedTheme == 'light' || !storedTheme && !systemIsDark) {
      document.documentElement.classList.add('theme--default');
      document.documentElement.classList.remove('theme--dark');
    }
  }

}