import {Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HttpClient} from '@angular/common/http';

import {delay, map, scan, Subject, switchMap, tap} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {provideRxStatefulClient, RxStatefulClient, withConfig} from "@angular-kit/rx-stateful/experimental";

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
        <div *ngIf="state.value">{{ state.value | json }}</div>
        <div *ngIf="state.isSuspense">loading</div>
      </div>
    </div>
    <div>
      <h4>State Accumulated</h4>
      <ul *ngFor="let v of stateAccumulated$ | async">
        <li>{{ v | json }}</li>
      </ul>
    </div>
    <div>
      <h4>Query Params</h4>
      <div>{{ query$ | async | json }}</div>
      <div>{{ value$ | async | json }}</div>
    </div>
  `,
  styles: [],
  providers: [
    provideRxStatefulClient(
      withConfig({ keepValueOnRefresh: false, errorMappingFn: (e) => e})
    ),
    // provideRxStatefulConfig({keepValueOnRefresh: true, errorMappingFn: (e) => e})
  ],
})
export class DemoRxStatefulComponent {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  refresh$$ = new Subject<any>();

  client = inject(RxStatefulClient);

  query$ = this.route.params;

  value$ = this.query$.pipe(switchMap(() => this.client.request(this.fetch()).pipe(
      map(v => v.value)
  )));

  instance = this.client.request(this.fetch(), {
    keepValueOnRefresh: false,
    keepErrorOnRefresh: false,
    refreshTrigger$: this.refresh$$,
    //refetchStrategies: [withAutoRefetch(10000, 20000)],
  });
  state$ = this.instance;
  stateAccumulated$ = this.state$.pipe(
    tap(console.log),
    scan((acc, value, index) => {
      // @ts-ignore
      acc.push({ index, value });

      return acc;
    }, [])
  );

  fetch(delayInMs = 800) {
    return this.http.get<any>('https://jsonplaceholder.typicode.com/todos/1').pipe(
      delay(delayInMs),
      map((v) => v?.title)
    );
  }

  constructor() {
    this.state$.subscribe();
    this.state$.subscribe();
  }
}
