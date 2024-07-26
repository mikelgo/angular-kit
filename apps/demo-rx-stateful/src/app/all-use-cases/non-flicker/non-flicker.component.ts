import {Component, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import {HttpClient} from "@angular/common/http";
import {ActivatedRoute} from "@angular/router";
import {BehaviorSubject, concatAll, delay, map, scan, Subject, switchMap, tap, toArray} from "rxjs";
import {provideRxStatefulClient, RxStatefulClient, withConfig} from "@angular-kit/rx-stateful/experimental";
import {rxStateful$, withRefetchOnTrigger} from "@angular-kit/rx-stateful";

@Component({
  selector: 'demo-non-flicker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1>DemoRxStatefulComponent</h1>
<!--    <div>-->
<!--      <button (click)="refresh$$.next(null)">refresh</button>-->
<!--    </div>-->
<!--    <div>-->
<!--      <h4>State</h4>-->
<!--      <div *ngIf="state$ | async as state">-->
<!--        <div *ngIf="state.value">{{ state.value | json }}</div>-->
<!--        <div *ngIf="state.isSuspense">loading</div>-->
<!--      </div>-->
<!--    </div>-->
<!--    <div>-->
<!--      <h4>State Accumulated</h4>-->
<!--      <ul *ngFor="let v of stateAccumulated$ | async">-->
<!--        <li>{{ v | json }}</li>-->
<!--      </ul>-->
<!--    </div>-->
    <!--    <div>-->
    <!--      <h4>Query Params</h4>-->
    <!--      <div>{{ query$ | async | json }}</div>-->
    <!--      <div>{{ value$ | async | json }}</div>-->
    <!--    </div>-->

    <!--    <br>-->
        <div>
          <button mat-button color="primary" (click)="page$$.next(-1)"> previous page </button>
          <button mat-button color="primary" (click)="page$$.next(1)"> next page </button>
          <button mat-button color="primary" (click)="refresh$$.next(null)"> Refresh current page </button>
          <div>
            <h4>State Accumulated</h4>
            <ul *ngFor="let v of state2Accumulated$ | async">
              <li>{{ v | json }}</li>
            </ul>
          </div>
        </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  providers: [
    provideRxStatefulClient(
      withConfig({ keepValueOnRefresh: false, errorMappingFn: (e) => e})
    ),
    // provideRxStatefulConfig({keepValueOnRefresh: true, errorMappingFn: (e) => e})
  ],
})
export class NonFlickerComponent {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  refresh$$ = new Subject<any>();

  client = inject(RxStatefulClient);

  query$ = this.route.params;

  value$ = this.query$.pipe(switchMap(() => this.client.request(this.fetch()).pipe(
    map(v => v.value)
  )));

  // instance = this.client.request(this.fetch(), {
  //   keepValueOnRefresh: false,
  //   keepErrorOnRefresh: false,
  //   refreshTrigger$: this.refresh$$,
  //   refetchStrategies: [withAutoRefetch(10000, 20000)],
  // });
  // state$ = this.instance;
  // stateAccumulated$ = this.state$.pipe(
  //   tap(console.log),
  //   scan((acc, value, index) => {
  //     @ts-ignore
  // acc.push({ index, value });
  //
  // return acc;
  // }, [])
  // );


  state$ = rxStateful$(this.fetch(450), {
    keepValueOnRefresh: false,
    keepErrorOnRefresh: false,
    refreshTrigger$: this.refresh$$,
    suspenseTimeMs: 3000,
    suspenseThresholdMs: 500
  });

  stateAccumulated$ = this.state$.pipe(
    tap(x => console.log({state: x})),
    scan((acc, value, index) => {
      // @ts-ignore
      acc.push({ index, value });

      return acc;
    }, [])
  );
  readonly page$$ = new BehaviorSubject(0)
  readonly page$ = this.page$$.pipe(
    scan((acc, curr) => acc + curr, 0)
  )

  state2$ = rxStateful$(
    (page) => this.fetchPage({
      page,
      delayInMs: 5000
    }).pipe(

    ),
    {
      suspenseThresholdMs: 500,
      suspenseTimeMs: 2000,
      sourceTriggerConfig: {
        trigger: this.page$
      },
      refetchStrategies: withRefetchOnTrigger(this.refresh$$)
    }
  )
  state2Accumulated$ = this.state2$.pipe(
    tap(x => console.log({state: x})),
    scan((acc, value, index) => {
      // @ts-ignore
      acc.push({ index, value });

      return acc;
    }, [])
  );

  fetch(delayInMs = 800) {
    return this.http.get<any>('https://jsonplaceholder.typicode.com/todos/1').pipe(
      delay(delayInMs),
      map((v) => v?.title),
      // tap(console.log)
    );
  }

  fetchPage(params: {
    delayInMs:number,
    page: number
  }) {

    return this.http.get<any>(`https://jsonplaceholder.typicode.com/todos?_start=${params.page * 5}&_limit=5`).pipe(
      delay(params.delayInMs),
      concatAll(),
      // @ts-ignore
      map((v) => v?.id),
      toArray()
    );
  }

  constructor() {
    this.state$.subscribe();
    this.state$.subscribe();
  }
}
