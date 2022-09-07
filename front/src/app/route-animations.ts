import {
  trigger,
  transition,
  style,
  query,
  group,
  animate,
} from '@angular/animations';

export const slider = [
  transition(':enter', [
    query(':enter', [], {optional: true})
  ]),
  transition('* => *', [
    style({ height: '!' }),
    query(':enter', style({ transform: 'translateX(100%)' })),
    query(':enter, :leave', style({ position: 'absolute', top: 0, left: 0, right: 0 })),
    group([
      query(':leave', [
        animate('.3s ease-in', style({ transform: 'translateX(-100%)' })),
      ], {optional: true}),
      query(':enter', animate('.3s ease-out', style({ transform: 'translateX(0)' }))),
    ]),
    query('router-outlet ~ *', [style({}), animate(1, style({}))], { optional: true })
  ])
];