import { AfterViewInit, Component, HostListener, OnInit } from '@angular/core';
import { SocketioService } from 'src/app/services/socketio.service';

@Component({
  selector: 'app-settings-panel',
  templateUrl: './settings-panel.component.html',
  styleUrls: ['./settings-panel.component.scss'],
  styles: [`

    .socketStatus {
      position: fixed;
      left: -0.4rem;
      top: 0.3rem;
      &:hover {
        transform: scale(1.2) translateX(10%) translateY(10%);
      }
      transition: transform 100ms;
    }

    .socketStatus > .button {
      border-radius: 0 50% 50% 0 !important;
      background-color: rgba(100,100,100, .7);
      width: 2.5rem;
      height: 2.5rem;
      font-size: 1.2rem;

      transition: background-color 200ms;
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
export class SettingsPanelComponent {

  isFullscreen: boolean = false;

  constructor() { }

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
      localStorage.setItem('qTheme', 'dark');
    } else {
      document.documentElement.classList.remove('theme--dark');
      document.documentElement.classList.add('theme--default');
      localStorage.setItem('qTheme', 'light');
    }
  }

  isDarkMode(): boolean {
    return document.documentElement.classList.contains('theme--dark');
  }
}
