import { Component, OnInit } from '@angular/core';
import { SocketioService } from 'src/app/services/socketio.service';

@Component({
  selector: 'app-rank',
  templateUrl: './rank.component.html',
  styleUrls: ['./rank.component.scss']
})
export class RankComponent implements OnInit {

  constructor(public sio: SocketioService) { }

  ngOnInit(): void { }

  getRank(): string {
    const s = this.sio.playerData?.public?.base?.scores;
    if (s) {
      const sorted = Object.keys(s).sort(function (a, b) { return s[b] - s[a] });
      const i = sorted.indexOf(this.sio.playerData?.myName!) + 1;
      // format as 1st, 2nd, 3rd, etc..
      return i + ([, 'st', 'nd', 'rd'][i / 10 % 10 ^ 1 && i % 10] || 'th');
    }
    return '';
  }
}
