import { trigger } from '@angular/animations';
import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { ChildrenOutletContexts, RouterOutlet } from '@angular/router';
import { slider } from './route-animations';

@Component({
  selector: 'app-root',
  template: ` <div [@.disabled]="disableAnimations" [@anim]="childAnimData(o)">
                <router-outlet #o="outlet"></router-outlet>
              </div>`,
  animations: [trigger('anim', slider)]
})
export class AppComponent implements AfterViewInit {

  disableAnimations: boolean = true;

  constructor() { }

  ngAfterViewInit() {
    this.applyCorrectTheme();
    setTimeout(() => {
      this.disableAnimations = false;
    });
  }

  childAnimData(routerOutlet: RouterOutlet) {
    if (routerOutlet.isActivated) {
      return routerOutlet?.activatedRoute?.firstChild?.snapshot?.data['anim']
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