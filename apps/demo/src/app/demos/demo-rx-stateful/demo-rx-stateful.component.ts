import {Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HttpClient} from "@angular/common/http";
import {rxStateful$} from "@angular-kit/rx-stateful";
import {delay, map, scan, Subject} from "rxjs";

@Component({
  selector: 'angular-kit-demo-rx-stateful',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1>DemoRxStatefulComponent</h1>
    <div>
      <button (click)="refresh$$.next(null)">refresh</button>
    </div>
    <div>
      <h4>State</h4>
         <div *ngIf="state$ | async as state">
           <div *ngIf="state.value">{{state.value | json}}</div>
           <div *ngIf="state.isSuspense"> loading</div>
         </div>
    </div>
    <div>
      <h4>State Accumulated</h4>
      <ul *ngFor="let v of stateAccumulated$ | async">
        <li> {{v | json}}</li>
      </ul>
    </div>
  `,
  styles: [],
})
export class DemoRxStatefulComponent {
  private http = inject(HttpClient)
  refresh$$ = new Subject<any>()


  instance = rxStateful$(this.fetch(), {
    keepValueOnRefresh: false,
    keepErrorOnRefresh: false,
    refreshTrigger$: this.refresh$$
  })
  state$ = this.instance.state$
  stateAccumulated$ = this.state$.pipe(
      scan((acc, value, index) => {
        // @ts-ignore
        acc.push({ index, value });

        return acc;
      }, [])
  );

  fetch(delayInMs = 1500) {
    return this.http
        .get<any>('https://jsonplaceholder.typicode.com/todos/1')
        .pipe(
            delay(delayInMs),
            map((v) => v?.title)
        );
  }

  constructor() {
    this.state$.subscribe()
    this.state$.subscribe()
  }
}
