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

  promptIdOnBallot?: string;
  lastNumGenerated?: number;
  colorClasses: string[];
  didReqNextBallot: boolean = false;

  constructor(public sio: SocketioService, private router: Router, private route: ActivatedRoute) {
    this.colorClasses = ['is-primary', 'is-secondary', 'is-tertiary', 'is-quaternary'];
  }

  ngAfterViewInit(): void {
    const param: string | null = this.route.snapshot.paramMap.get('ballotIndex');

    if (this.sio.gameData?.qPromptAnswers && param) {
      this.promptIdOnBallot = util.findBallotIndex(this.sio.gameData?.qPromptAnswers, param);
    }
  }

  promptIsVoted() {
    const piv = util.promptIsVoted(this.sio.gameData?.qPromptAnswers, this.promptIdOnBallot || '');
    if (piv) {      
      if (!this.didReqNextBallot) {
        this.didReqNextBallot = true;
        setTimeout(() => {
          this.sio.emit('qNextBallot');
        }, 1000)
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
}
