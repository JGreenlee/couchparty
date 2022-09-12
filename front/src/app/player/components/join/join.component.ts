import { AfterViewInit, Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SocketioService } from 'src/app/services/socketio.service';

@Component({
  selector: 'app-join',
  templateUrl: './join.component.html',
  styleUrls: ['./join.component.scss']
})
export class JoinComponent implements AfterViewInit {

  freeze: boolean = false;
  submittedResult: boolean = false;

  joinFailedMessage!: string;

  // a FormGroup which houses the fields we will apply validation to
  form = new FormGroup({
    qName: new FormControl('', [Validators.required, Validators.minLength(2)]),
    qRoomCode: new FormControl('', [Validators.required, Validators.minLength(4), Validators.maxLength(4)])
  });
  get f() { return this.form.controls; }

  constructor(public sio: SocketioService) { }

  ngAfterViewInit(): void {
    if (this.sio.DEBUG) {
      setTimeout(() => {
        const l = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 52)];
        this.f.qName.setValue(l.repeat(5));
        this.f.qRoomCode.setValue('TEST');
      }, 300);
    }
  }

  /**
   * Ensures that form data passes validation, emits a 'requestJoin' event, and handles the result
   */
  trySubmit(): void {

    if (!this.freeze && this.f.qName.valid && this.f.qRoomCode.valid) {
      this.freeze = true;
      this.sio.emit('requestJoin', {
        'uid': this.sio.uid,
        'roomCode': this.f.qRoomCode.value,
        'name': this.f.qName.value,
      }, (success, response) => {
        if (success) {
          this.sio.updateMyPlayerData(response);
        } else {
          this.joinFailedMessage = response;
        }
      });
    }
  }
}
