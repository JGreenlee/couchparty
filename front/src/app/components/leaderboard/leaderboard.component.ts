import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Socket } from 'socket.io-client';
import { SocketioService } from 'src/app/services/socketio.service';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss']
})
export class LeaderboardComponent implements OnInit {

  constructor(public router : Router, public sio : SocketioService) { }

  ngOnInit(): void {

  }

  rank(obj : object) {

    let sortable : any[] = [];
    for (var k in obj) {
        sortable.push([k, obj[k]]);
    }
    
    return sortable.sort(function(a, b) {
        return b[1] - a[1];
    });
  }

  startNextRound() {
    this.sio.emit('startRound', ()=>{
      // TODO ack startRound
    })
  }

}
