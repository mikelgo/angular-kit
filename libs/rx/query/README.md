# @angular-kit/query

This package provides a nice way to fetch data from an endpoint and
expose certain query states like a `isLoading` and `isRefreshing` state.

## Features
- 🟢 value state
- 🔄 loading and refreshing state
- ❌ error state

## Basic Usage

```typescript
import { rxQuery$, RxQuery } from '@angular-kit/rx/query';
@Component({
  template: `
    <button (click)="refreshCommand$.next(null)">refresh</button>
    <div *ngIf="query$ | async as req">
      <div>isloading {{ req!.isLoading! }} isRefreshing {{ req!.isRefreshing }}</div>
      <div>values {{ req?.value | json }}</div>
    </div>
  `,
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SomeComponent implements OnInit {
  private http: HttpClient = inject(HttpClient);
  refreshCommand$ = new Subject();

  query$: Observable<RxQuery<any>> = rxQuery$(this.fetch(10), {refreshTrigger$: this.refreshCommand$});

  fetch(count: number) {
    return this.http.get('https://jsonplaceholder.typicode.com/posts').pipe(
      delay(500),
      map((x) => (x as any[]).slice(0, Math.random() > 0.5 ? 10 : 20))
    );
  }
}
```

Note: the example above passes a refreshCommand$, however it is optional.

## Configuration
Use the `RxQueryConfig` to configure the default behavior of the `rxQuery$` operator. 

It does offer the following options:
- `refreshTrigger$?: Subject<unknown>`: whenever this subject emits a value, the query will be refreshed.
- `keepValueOnRefresh?: boolean`: if true, the value will be kept during refresh until the new value is available. If false, the value will be set to `null` until the new value is available.


