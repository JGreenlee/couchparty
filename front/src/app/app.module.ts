import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule, CustomReuseStrategy } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from './shared/shared.module';
// import { EmojiDirective } from './emoji.directive';

import { AppComponent } from './app.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { HostComponent } from './components/host/host.component';
import { SplashComponent } from './components/splash/splash.component';
import { LobbyComponent } from './components/lobby/lobby.component';
import { AnsweringComponent } from './components/answering/answering.component';
import { VotingComponent } from './components/voting/voting.component';
import { LeaderboardComponent } from './components/leaderboard/leaderboard.component';
import { ReactiveFormsModule } from '@angular/forms';
import { PlayerModule } from './player/player.module';
import { OneTimeDirective } from './one-time.directive';
import { RouteReuseStrategy } from '@angular/router';
import { SettingsPanelComponent } from './components/settings-panel/settings-panel.component';
import { OrientationNoticeComponent } from './components/orientation-notice/orientation-notice.component';

@NgModule({
  declarations: [
    AppComponent,
    LobbyComponent,
    SplashComponent,
    LeaderboardComponent,
    HostComponent,
    NotFoundComponent,
    AnsweringComponent,
    VotingComponent,
    SettingsPanelComponent,
    OrientationNoticeComponent,
    OneTimeDirective,
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    PlayerModule,
    SharedModule,
  ],
  providers: [{
    provide: RouteReuseStrategy,
    useClass: CustomReuseStrategy
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
