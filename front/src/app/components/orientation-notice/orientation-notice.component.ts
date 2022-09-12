import { AfterViewInit, Component, HostListener, OnInit } from '@angular/core';
import { SocketioService } from 'src/app/services/socketio.service';

@Component({
  selector: 'app-orientation-notice',
  templateUrl: './orientation-notice.component.html',
  styleUrls: ['./orientation-notice.component.scss'],
})
export class OrientationNoticeComponent {

  constructor() { }
}
