import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LobbyComponent } from './components/lobby/lobby.component';
import { JoinComponent } from './player/components/join/join.component';
import { SplashComponent } from './components/splash/splash.component';
import { AppComponent } from './app.component';
import { HostComponent } from './components/host/host.component';
import { PlayerComponent } from './player/player/player.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { LeaderboardComponent } from './components/leaderboard/leaderboard.component';
import { AnsweringComponent } from './components/answering/answering.component';
import { QuizComponent } from './player/components/quiz/quiz.component';
import { BallotComponent } from './player/components/ballot/ballot.component';
import { VotingComponent } from './components/voting/voting.component';
import { RankComponent } from './player/components/rank/rank.component';

const routes: Routes = [
  {
    path: '', component: AppComponent, children: [
      {
        path: '', component: HostComponent, children: [
          { path: '', component: SplashComponent },
          { path: 'lobby', component: LobbyComponent, data: { animation: 'isRight' } },
          { path: 'answering', component: AnsweringComponent, data: { animation: 'isRight' } },
          { path: 'voting', component: VotingComponent, data: { animation: 'isRight' } },
          { path: 'voting/:ballotIndex', component: VotingComponent, data: { animation: 'isRight' } },
          { path: 'scores', component: LeaderboardComponent, data: { animation: 'isRight' } },
        ]
      },
      {
        path: '', component: PlayerComponent, children: [
          { path: 'play', component: JoinComponent, data: { animation: 'isRight' } },
          { path: 'quiz', component: QuizComponent, data: { animation: 'isRight' } },
          { path: 'ballot', component: BallotComponent, data: { animation: 'isRight' } },
          { path: 'ballot/:ballotIndex', component: BallotComponent, data: { animation: 'isRight' } },
          { path: 'rank', component: RankComponent, data: { animation: 'isRight' } },
        ]
      },
      { path: 'join', redirectTo: '/play', pathMatch: 'full' },
    ]
  },
  { path: "**", component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
