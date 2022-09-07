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

  promptIdOnBallot?: string = '';
  didReqNextBallot: boolean = false;

  constructor(public sio: SocketioService, private router: Router, private route: ActivatedRoute) { }

  ngAfterViewInit(): void {
    const param: string | null = this.route.snapshot.paramMap.get('ballotIndex');

    if (this.sio.playerData?.qPromptAnswers && param) {
      this.promptIdOnBallot = util.findBallotIndex(this.sio.playerData?.qPromptAnswers, param);
    } else {
      console.error('URL param "ballotIndex" must be set');
    }

    if (this.sio.DEBUG) {
      if (this.isEligibleVoter()) {
        setTimeout(() => {
          this.vote(0, 0);
        }, 500);
      }
    }
  }

  promptIsVoted() {
    const piv = util.promptIsVoted(this.sio.gameData?.qPromptAnswers, this.promptIdOnBallot || '');
    if (piv) {
      return true;
    } else {
      return false;
    }
  }

  promptText(): string | undefined {
    if (this.promptIdOnBallot) {
      return this.sio.playerData?.qPromptAnswers?.[this.promptIdOnBallot][0]?.promptText;
    } else {
      return undefined;
    }
  }

  isEligibleVoter() {
    return !this.sio.playerData?.qPrompts?.find(o => o.promptId == this.promptIdOnBallot)
  }

  vote(chosenIndex: number, colorIndex) {
    if (this.promptIdOnBallot) {
      this.sio.emit('qVote', this.promptIdOnBallot, chosenIndex, colorIndex, (playerData) => {
        this.sio.updateMyPlayerData(playerData);
      });
    }
  }
}
