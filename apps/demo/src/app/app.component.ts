import { Component } from '@angular/core';
import {BehaviorSubject, delay, interval, map, of, scan, Subject, switchMap, take} from "rxjs";
import {HttpClient} from "@angular/common/http";
interface Foo {
  bar?: {
    label?: string
  }
}
@Component({
  selector: 'angular-kit-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'demo';
  source$ = interval(1000).pipe(
    take(1),
    switchMap(() => of<Foo>({ bar: { label: ''}})),
  );
  error$ = of('test').pipe(
    map(() => {
      throw new Error('BOOOM');
    })
  )

  nextPost = new BehaviorSubject(1);
  nextPost$ = this.nextPost.pipe(
    scan((acc, value) => acc + 1, 0)
  );

  //rxRequest$  = this.getPost(1)
  rxRequest$ = this.nextPost$.pipe(
    switchMap(n => this.getPost(n)),
  )

  refreshCommand$ = new Subject();

  v: undefined | { f: string }

  constructor(private http: HttpClient) {
    //this.query$.subscribe()

  }

  getPost(n: number) {
    return this.http.get(`https://jsonplaceholder.typicode.com/posts/${n}`).pipe(delay(1000));
  }


  fetch(count: number) {

    return this.http.get(('https://jsonplaceholder.typicode.com/posts')).pipe(
      delay(5000),
      map(x => (x as any[]).slice(0, (Math.random() > 0.5 ? 10 : 20))),
    )

  }
}
