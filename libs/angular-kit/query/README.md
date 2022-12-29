# @code-workers-io/angular-kit/query$

This package provides a nice way to fetch data from an endpoint and
expose certain states like a `isLoading` and `isRefreshing` state.

While `refreshing` the current values are kept and updated once the
refresh is done.

## Usage

```typescript
import { query$ } from '@code-workers.io/angular-kit/query';
@Component({
  template: ` <button (click)="refreshCommand$.next(null)">refresh</button>
    <div *ngIf="query$ | async as req">
      <div>isloading {{req!.isLoading!}} isRefreshing {{req!.isRefreshing}} </div>
      <div>values {{req?.value | json}}</div>
    </div>

  `,
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SomeComponent implements OnInit {
  private http: HttpClient = inject(HttpClient);
  refreshCommand$ = new Subject();

  query$: Observable<Query<any>> =  query$(this.fetch(10), this.refreshCommand$)

  fetch(count: number) {

    return this.http.get(('https://jsonplaceholder.typicode.com/posts')).pipe(
      delay(500),
      map(x => (x as any[]).slice(0, (Math.random() > 0.5 ? 10 : 20))),
    )

  }
}
```
Note: the example above passes a refreshCommand$, however it is optional.

## Compatibility
* Version 1.x.x is compatible with Angular >= 12.0.0

