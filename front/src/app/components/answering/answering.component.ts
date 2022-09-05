import { Component, OnInit } from '@angular/core';
import { SocketioService } from 'src/app/services/socketio.service';

@Component({
  selector: 'app-answering-page',
  templateUrl: './answering.component.html',
  styleUrls: ['./answering.component.scss']
})
export class AnsweringComponent implements OnInit {

  constructor(public sio : SocketioService) { }

  ngOnInit(): void {
    this.sio.emit('startGame', ()=>{
      // TODO ack startGame
    });
  }

  hasAnswered(pn : string) {
    const f = this.sio.gameData?.qPromptAnswers;
    if (f) {
      return Object.values(f).find(o => o.find(q => q.player == pn))
    }
    return false;
  }
}
