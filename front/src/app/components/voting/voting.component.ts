import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketioService } from 'src/app/services/socketio.service';
import * as util from 'src/app/services/util';

@Component({
  selector: 'app-voting',
  templateUrl: './voting.component.html',
  styleUrls: ['./voting.component.scss']
})
export class VotingComponent implements AfterViewInit {

  math = Math;
  values = Object.values;

  started?: boolean;
  lastNumGenerated?: number;
  colorClasses: string[];
  twoRandColorClasses: string;
  didReqNextBallot: boolean = false;

  constructor(public sio: SocketioService, private router: Router, private route: ActivatedRoute) {
    this.colorClasses = ['is-primary', 'is-secondary', 'is-tertiary', 'is-quaternary'];
    this.twoRandColorClasses = [...this.colorClasses].sort(() => 0.5 - Math.random()).splice(0, 2).join(' ');
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.started = true;
    }, 300)
  }

  promptIdOnBallot(): string {
    const param: string | null = this.route.snapshot.paramMap.get('ballotIndex');

    if (this.sio.gameData?.qPromptAnswers && param) {
      return util.findBallotIndex(this.sio.gameData?.qPromptAnswers, param) || '';
    } else {
      return '';
    }
  }

  promptIsVoted() {
    const piv = util.promptIsVoted(this.sio.gameData?.qPromptAnswers, this.promptIdOnBallot() || '');
    if (piv) {
      if (!this.didReqNextBallot) {
        this.didReqNextBallot = true;
        setTimeout(() => {
          this['promptVoted'] = true;
        }, 200);
        setTimeout(() => {
          this.sio.emitTimeout(3000, 'qNextBallot', (err)=>{
            console.error(err);
          });
        }, 8000);
      }
      return true;
    } else {
      return false;
    }
  }

  randomColorClass() {
    if (this.lastNumGenerated != undefined) {
      this.lastNumGenerated = (this.lastNumGenerated + 1) % 4
    } else {
      this.lastNumGenerated = Math.floor(Math.random() * 4);
    }

    switch (this.lastNumGenerated) {
      case 0: return 'is-primary';
      case 1: return 'is-secondary';
      case 2: return 'is-tertiary';
      case 3: return 'is-quaternary';
    }
    return;
  }

  getAwaitingStatus(triggerEvent: string, delay: number, newEvent: string) {
    if (this[newEvent]) {
      return '';
    }
    if (this[triggerEvent]) {
      setTimeout(() => {
        this[newEvent] = true;
      }, delay);
      return '';
    }
    return 'awaiting'
  }

  doTransition(triggerEvent: string, delay: number, newEvent: string) {
    if (this[newEvent]) {
      return '';
    }
    const d = Date.now();
    console.log('check ' + triggerEvent);
    console.log("now", d);
    console.log(this[triggerEvent]);

    if (this[triggerEvent] && d > this[triggerEvent] + delay) {
      this[newEvent] = d;
      return '';
    } else {
      return 'awaiting'
    }
  }
}
