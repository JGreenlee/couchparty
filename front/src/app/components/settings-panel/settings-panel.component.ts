import { AfterViewInit, Component, HostListener, OnInit } from '@angular/core';
import { SocketioService } from 'src/app/services/socketio.service';

@Component({
  selector: 'app-settings-panel',
  templateUrl: './settings-panel.component.html',
  styleUrls: ['./settings-panel.component.scss'],
})
export class SettingsPanelComponent {

  isFullscreen: boolean = false;
  shown: boolean = false;

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

  setShown(b : boolean) {
    setTimeout(()=>{
      this.shown = b;
    });
  }

  isDarkMode(): boolean {
    return document.documentElement.classList.contains('theme--dark');
  }
}
