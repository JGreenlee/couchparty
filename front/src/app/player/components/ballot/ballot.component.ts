import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SocketioService } from 'src/app/services/socketio.service';
import * as util from 'src/app/services/util';

@Component({
  selector: 'app-ballot',
  templateUrl: './ballot.component.html',
  styleUrls: ['./ballot.component.scss']
})
export class BallotComponent implements AfterViewInit {

  didReqNextBallot: boolean = false;
  twoRandColorClasses: string[];

  constructor(public sio: SocketioService, private router: Router, private route: ActivatedRoute) {
    this.twoRandColorClasses = util.twoRandColorClasses();
    console.log(this.twoRandColorClasses);
    
  }

  ngAfterViewInit(): void {
    if (this.sio.DEBUG) {
      if (this.isEligibleVoter()) {
        setTimeout(() => {
          // this.vote(0, 0);
        }, 500);
      }
    }
  }

  promptIdOnBallot() : string {
    const param: string | null = this.route.snapshot.paramMap.get('ballotIndex');

    if (this.sio.playerData?.qPromptAnswers && param) {
      return util.findBallotIndex(this.sio.playerData?.qPromptAnswers, param) || '';
    } else {
      return '';
    }
  }

  promptIsVoted() {
    const piv = util.promptIsVoted(this.sio.gameData?.qPromptAnswers, this.promptIdOnBallot() || '');
    if (piv) {
      return true;
    } else {
      return false;
    }
  }

  promptText(): string | undefined {
    const pid = this.promptIdOnBallot();
    if (pid) {
      return this.sio.playerData?.qPromptAnswers?.[pid][0]?.promptText;
    } else {
      return undefined;
    }
  }

  isEligibleVoter() {
    return !this.sio.playerData?.qPrompts?.find(o => o.promptId == this.promptIdOnBallot())
  }

  vote(chosenIndex: number, colorClass : string) {
    const pid = this.promptIdOnBallot();
    const colorIndex = util.colorClasses.indexOf(colorClass);
    if (pid) {
      this.sio.emit('qVote', pid, chosenIndex, colorIndex, (playerData) => {
        this.sio.updateMyPlayerData(playerData);
      });
    }
  }
}
