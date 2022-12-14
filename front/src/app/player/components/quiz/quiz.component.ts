import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SocketioService } from 'src/app/services/socketio.service';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss']
})
export class QuizComponent implements OnInit, AfterViewInit {

  quizSubmitted: boolean = false;

  form = new FormGroup({
    qFirstAnswer: new FormControl('', [Validators.required]),
    qSecondAnswer: new FormControl('', [Validators.required])
  });
  quizSubmitStatus?: string;

  constructor(public sio: SocketioService) { }

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    if (this.sio.DEBUG) {
      setTimeout(() => {
        const l = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
        this.f.qFirstAnswer.setValue(this.sio.playerData?.qPrompts?.[0]?.promptText + '--'+this.sio.playerData?.myName);
        this.f.qSecondAnswer.setValue(this.sio.playerData?.qPrompts?.[1]?.promptText + '--'+this.sio.playerData?.myName);
        setTimeout(() => {
          this.onSubmit();
        }, 300)
      }, 300);
    }
  }

  onSubmit() {

    let qAnswers = [
      {
        promptId: this.sio.playerData?.qPrompts?.[0]?.promptId,
        promptAnswer: this.f.qFirstAnswer.value
      },
      {
        promptId: this.sio.playerData?.qPrompts?.[1]?.promptId,
        promptAnswer: this.f.qSecondAnswer.value
      },
    ]

    this.sio.emitTimeout(5000, 'qAnswers', qAnswers, (err, ack: boolean) => {
      if (err) {
        this.quizSubmitted = true;
        this.quizSubmitStatus = 'err: ' + err;
      } else if (ack) {
        this.quizSubmitted = true;
        this.quizSubmitStatus = 'submitted <i class="fa fa-check"></i>';
      }
    });
  }
}
