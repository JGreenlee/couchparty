import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { slider, stepper } from './route-animations';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [slider, stepper]
})
export class AppComponent implements AfterViewInit {

  constructor(public metaService: Meta) { }

  ngAfterViewInit() {
    this.applyCorrectTheme();
  }

  @HostListener('window:storage', ['$event'])
  applyCorrectTheme() {
    let storedTheme = localStorage.getItem('quailTheme');
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