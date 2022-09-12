import { Component, HostListener, OnInit } from '@angular/core';
import * as util from '../../services/util'

@Component({
  selector: 'app-splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.scss']
})
export class SplashComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.setScale();
    setInterval(this.setScale, 1000);
  }

  @HostListener("window:resize", ['event'])
  setScale() {
    util.calculateScale(550, 1400, 600, 1000);
  }

}
