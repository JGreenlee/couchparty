import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SocketioService } from 'src/app/services/socketio.service';

@Component({
  selector: 'app-join',
  templateUrl: './join.component.html',
  styleUrls: ['./join.component.scss']
})
export class JoinComponent implements OnInit, AfterViewInit {

  freeze: boolean = false;
  submittedResult: boolean = false;

  joinFailedMessage!: string;

  form = new FormGroup({
    qName: new FormControl('', [Validators.required, Validators.minLength(4)]),
    qRoomCode: new FormControl('', [Validators.required, Validators.minLength(4), Validators.maxLength(4)])
  });

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

  get f() {
    return this.form.controls;
  }

  trySubmit(): void {

    if (!this.freeze && this.f.qName.valid && this.f.qRoomCode.valid) {
      this.freeze = true;
      this.sio.emit('requestJoin', {
        'roomCode': this.f.qRoomCode.value,
        'name': this.f.qName.value,
        'uid': this.sio.uid
      }, (success, response) => {
        if (success) {
          this.sio.updateMyPlayerData(response);
        } else {
          this.joinFailedMessage = response;
        }
      });
    }
  }

  ngOnInit(): void {
  }

}
