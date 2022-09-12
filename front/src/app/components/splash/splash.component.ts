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

  @HostListener("window:resize", ['event'])
  ngAfterViewInit(): void {
    util.calculateScale(400, 1400, 600, 1000);
  }

}
