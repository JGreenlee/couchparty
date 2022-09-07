import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from '../app-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';

import { PlayerComponent } from './player/player.component';
import { JoinComponent } from './components/join/join.component';
import { QuizComponent } from './components/quiz/quiz.component';
import { BallotComponent } from './components/ballot/ballot.component';
import { RankComponent } from './components/rank/rank.component';

@NgModule({
  declarations: [
    PlayerComponent,
    JoinComponent,
    BallotComponent,
    QuizComponent,
    BallotComponent,
    RankComponent
  ],
  imports: [
    AppRoutingModule,
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
  ]
})
export class PlayerModule { }
