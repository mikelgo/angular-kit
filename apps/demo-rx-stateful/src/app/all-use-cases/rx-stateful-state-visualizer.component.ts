import {Component, input} from '@angular/core';
import { CommonModule } from '@angular/common';
import {RxStateful} from "@angular-kit/rx-stateful";

type Input = {
  index: number;
  value: RxStateful<any>
}

@Component({
  selector: 'rx-stateful-state-visualizer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ul>
      @for(s of state(); track s.index){
        <li>{{s |json}}</li>
      }
    </ul>
  `
})
export class RxStatefulStateVisualizerComponent {
  state = input<Input[]>([])
}
