import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {runEffect$} from "@angular-kit/rx/effect";
import {of, tap} from "rxjs";

@Component({
  selector: 'angular-kit-effect',
  standalone: true,
  imports: [CommonModule],
  template: `<p>effect works!</p>`,
  styles: [],
})
export class EffectComponent {
  constructor() {

    runEffect$(of(1).pipe(tap(console.log)))

    runEffect$(   of(100000).subscribe(console.log))


    runEffect$(of(10939), (v) => console.log('haha ', v))
  }
}
