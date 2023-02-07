import {
  catchError,
  distinctUntilChanged,
  map,
  merge,
  Observable,
  of,
  ReplaySubject,
  scan,
  share,
  startWith,
  Subject,
  switchMap,
} from 'rxjs';

export interface RxQuery<T, E> {
  value: T | null | undefined;
  isLoading: boolean;
  isRefreshing: boolean;
  error: E | undefined;
}

export interface RxQueryConfig {
  refreshTrigger$?: Subject<unknown>;
  keepValueOnRefresh?: boolean;
}

export function rxQuery$<T, E = unknown>(source$: Observable<T>): Observable<RxQuery<T, E>>;
export function rxQuery$<T, E = unknown>(source$: Observable<T>, config: RxQueryConfig): Observable<RxQuery<T, E>>
export function rxQuery$<T, E = unknown>(source$: Observable<T>, config?: RxQueryConfig): Observable<RxQuery<T, E>> {

  const mergedConfig: RxQueryConfig = {
    keepValueOnRefresh: true,
    ...config
  }

  const refresh$ = mergedConfig?.refreshTrigger$ ?? new Subject<unknown>();
  const sharedSource$ = source$.pipe(
    share({
      connector: () => new ReplaySubject(1),
    }),
    catchError((error) => of({ error: error })),
  );

  const request$: Observable<Partial<RxQuery<any, any>>> = sharedSource$.pipe(
    map((v) => ({ value: v, isLoading: false, isRefreshing: false })),
    startWith({ isLoading: true, isRefreshing: false })
  );


  const refreshedRequest$: Observable<Partial<RxQuery<any, any>>> = refresh$.pipe(
    switchMap(() =>
      sharedSource$.pipe(
        map((v) => ({ value: v, isLoading: false, isRefreshing: false })),
        mergedConfig?.keepValueOnRefresh ? startWith({ isLoading: true, isRefreshing: true }) :  startWith({ isLoading: true, isRefreshing: true,  value: null }),
      )
    )
  );

  return merge(request$, refreshedRequest$).pipe(
    scan(
      (acc, curr) => {
        return { ...acc, ...curr };
      },
      { isLoading: false, isRefreshing: false, value: undefined, error: undefined }
    ),
    distinctUntilChanged(),
    share({
      connector: () => new ReplaySubject(1),
      resetOnError: false,
      resetOnComplete: false,
      resetOnRefCountZero: false,
    })
  );
}
