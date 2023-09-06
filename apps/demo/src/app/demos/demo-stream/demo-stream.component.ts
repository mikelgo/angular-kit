import {Component, Injectable} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DemoOnchangesComponent} from "../../demo-onchanges/demo-onchanges.component";
import {StreamDirective} from "@angular-kit/stream";
import {
  BehaviorSubject,
  delay,
  EMPTY,
  interval,
  map,
  mergeAll,
  Observable,
  of,
  ReplaySubject,
  scan,
  Subject,
  switchMap,
  take,
  takeUntil,
  throwError
} from "rxjs";
import {HttpClient} from "@angular/common/http";

interface Foo {
  bar?: {
    label?: string;
  };
}

@Component({
  selector: 'angular-kit-demo-stream',
  standalone: true,
  imports: [CommonModule, DemoOnchangesComponent, StreamDirective],
  template: `
    <button (click)="id$.next(random())"> next id</button>
    <button (click)="name$.next('Hi ' + random())"> next name</button>
    <demo-onchanges [name]="(name$ | async)!"  [value]="(id$ | async)!"></demo-onchanges>
    <br>
    <hr>
    <button (click)="completeSignal$$.next(1)">complete</button>
    <button (click)="refreshCommand$.next(1)">refresh</button>
    <ng-container
        *stream="
    complete$;
    let v;
    let error = error;
    let complete = completed;
    errorTemplate: errorTemplate;
    completeTemplate: completeTemplate

  "
    >
      Complete {{ complete }} Value: {{ v | json }}
    </ng-container>

    <!--<ng-container *subscribe="source$ as foo">
      {{ foo }}
    </ng-container>


    <ng-container *subscribe="error$; let v; let error=error">
      <div>
        Value: {{ v | json }}
        Error: {{ error }}
      </div>

    </ng-container>-->
    <br />
    <hr />
    <button (click)="nextPost.next(1)">reload</button>
    <button (click)="sourceProvider.provideRefreshSource()">refresh source</button>
    <button (click)="sourceProvider.provideErrorSource()">error source</button>

    <ng-container
        *stream="
    rxRequest$;
    let v;
    let error = error;
    let complete = completed;
    let loading = loading;
    refreshSignal: nextPost;
    loadingTemplate: loadingTemplate;
    errorTemplate: errorTemplate;
    completeTemplate: completeTemplate;
    keepValueOnLoading: true
    renderCallback: render$$
  "
    >
      Complete {{ complete }}
      <br />
      Error {{ error }}
      <br />
      Loading {{ loading }}
      <br />
      {{ v | json }}
    </ng-container>
    <ng-template #loadingTemplate let-loading="loading">
      <div>Loading...</div>
      Loading {{ loading }}
    </ng-template>
    <ng-template #errorTemplate let-error="error">
      <div>ERROR...</div>
      Error {{ error }}
    </ng-template>

    <ng-template #completeTemplate let-completed="completed">
      <div>COMPLETE...</div>
      completed {{ completed }}
    </ng-template>

  `,
  styles: [],
})
export class DemoStreamComponent {
  name$ = new BehaviorSubject<string>('Hi');
  id$ = new BehaviorSubject<number>(10);


  title = 'demo';
  completeSignal$$ = new Subject<any>();
  source$ = interval(1000).pipe(
      take(1),
      switchMap(() => of<Foo>({ bar: { label: '' } })),
      takeUntil(this.completeSignal$$)
  );
  error$ = throwError(() => new Error('BOOOM'));
  complete$ = EMPTY;

  nextPost = new BehaviorSubject(1);
  nextPost$ = this.nextPost.pipe(scan((acc, value) => acc + 1, 0));

  rxRequest$ = this.nextPost$.pipe(switchMap((n) => this.getPost(n)));

  refreshCommand$ = new Subject();

  v: undefined | { f: string };
  render$$ = new ReplaySubject<any>();

  constructor(private http: HttpClient, public sourceProvider: ValueProvider) {
    //this.query$.subscribe()
    this.sourceProvider.provideErrorSource();

    /* rxQuery$(this.fetch(0), {
       refreshTrigger$: this.refreshCommand$,
       keepValueOnRefresh: false,
     }).subscribe(console.log)*/

    //this.render$$.subscribe(x => console.log('rendered value', x));
  }

  getPost(n: number) {
    return this.http.get(`https://jsonplaceholder.typicode.com/posts/${n}`).pipe(delay(1000));
  }

  fetch(count: number) {
    return this.http.get('https://jsonplaceholder.typicode.com/posts').pipe(
        delay(1000),
        map((x) => (x as any[]).slice(0, Math.random() > 0.5 ? 10 : 20))
    );
  }


  random() {
    return Math.random();
  }
}
@Injectable({ providedIn: 'root' })
export class ValueProvider {
  sourceProvider$$ = new ReplaySubject<Observable<any>>(1);
  source$ = this.sourceProvider$$.asObservable().pipe(mergeAll());

  refreshSignal = new BehaviorSubject(1);
  refreshSignal$ = this.refreshSignal.pipe(scan((acc, value) => acc + 1, 0));
  constructor(private http: HttpClient) {}
  provideRefreshSource() {
    this.sourceProvider$$.next(this.refreshSignal$.pipe(switchMap((n) => this.getPost(n))));
  }

  provideErrorSource() {
    this.sourceProvider$$.next(throwError(() => new Error('🔥')));
  }

  getPost(n: number) {
    return this.http.get(`https://jsonplaceholder.typicode.com/posts/${n}`).pipe(delay(1000));
  }
}

