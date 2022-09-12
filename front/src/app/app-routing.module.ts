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

import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy } from '@angular/router';

@NgModule({
  imports: [RouterModule.forRoot([
    {
      path: '', component: SplashComponent, data: { anim: 10 }
    },
    {
      path: '', component: HostComponent, children: [
        { path: 'lobby', component: LobbyComponent, data: { anim: 50 } },
        { path: 'answering', component: AnsweringComponent, data: { anim: 55 } },
        { path: 'voting', component: VotingComponent, data: { anim: 60 } },
        { path: 'voting/:ballotIndex', component: VotingComponent, data: { anim: 61 } },
        { path: 'scores', component: LeaderboardComponent, data: { anim: 65 } },
      ]
    },
    {
      path: '', component: PlayerComponent, children: [
        { path: 'play', component: JoinComponent, data: { anim: 5 } },
        { path: 'join', redirectTo: '/play', pathMatch: 'full' },
        { path: 'quiz', component: QuizComponent, data: { anim: 15 } },
        { path: 'ballot', component: BallotComponent, data: { anim: 20 } },
        { path: 'ballot/:ballotIndex', component: BallotComponent, data: { anim: 25 } },
        { path: 'rank', component: RankComponent, data: { anim: 30 } },
      ]
    },
    { path: "**", component: NotFoundComponent }
  ])],
  exports: [RouterModule]
})
export class AppRoutingModule { }

//
//
// ReuseStrategy

export class CustomReuseStrategy implements RouteReuseStrategy {

  handlers: { [key: string]: DetachedRouteHandle | null } = {};

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return false;
  }

  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
    this.handlers[route.routeConfig!.path!] = null;
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    return !!route.routeConfig && !!this.handlers[route.routeConfig!.path!];
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    if (!route.routeConfig) {
      return null;
    }
    return this.handlers[route.routeConfig!.path!];
  }

  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    
    return future.component == AppComponent
      || curr.component == HostComponent && future.component == HostComponent
      || curr.component == PlayerComponent && future.component == PlayerComponent;
  }
}