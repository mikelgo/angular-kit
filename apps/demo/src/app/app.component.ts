import {ChangeDetectionStrategy, Component, Injectable} from '@angular/core';
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
  throwError,
} from 'rxjs';
import {HttpClient} from '@angular/common/http';

interface Foo {
  bar?: {
    label?: string;
  };
}
@Component({
  selector: 'angular-kit-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
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

  onResize($event: any) {
    //console.log($event);
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
