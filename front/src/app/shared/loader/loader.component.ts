import { Component } from '@angular/core';

@Component({
  selector: 'app-loader',
  template: `<div class="loader mx-auto my-4"></div>`,
  styles: [`
        .loader {
          width: 3em;
          height: 3em;
          position: relative;
        }
        .loader:before, .loader:after {
          background: currentcolor;
          content: "";
          display: block;
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 50%;
          transform-origin: 50% 100%;	
          animation-duration: 2s;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          clip-path: polygon(0 0,100% 0,50% 100%);
          -webkit-clip-path: polygon(0 0,100% 0,50% 100%);
        }

        .loader:before {
          animation-name: spinA;
        }
        .loader:after {
          animation-name: spinB;
        }
        @keyframes spinA {
          from, 25% { transform: rotate(0deg) }
          50%, 75% { transform: rotate(180deg) }
          to { transform: rotate(360deg) }
        }
        @keyframes spinB {
          from { transform: rotate(90deg) }
          25%, 50% { transform: rotate(270deg) }
          75%, to { transform: rotate(450deg) }
        }
  `]
})
export class LoaderComponent {}
