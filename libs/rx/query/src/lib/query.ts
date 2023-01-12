import {catchError, map, merge, Observable, of, ReplaySubject, scan, share, startWith, Subject, switchMap,} from 'rxjs';

export interface Query<T> {
  value: T | null | undefined;
  isLoading: boolean;
  isRefreshing: boolean;
}

export function query$<T>(source$: Observable<T>, refreshCommand$?: Subject<unknown>): Observable<Query<T>> {
  const refresh$ = refreshCommand$ ?? new Subject<unknown>();
  const sharedSource$ = source$.pipe(
    share({
      connector: () => new ReplaySubject(1),
    }),
    catchError((_) => of({ isLoading: false, isRefreshing: false, value: null }))
  );

  const request$: Observable<Partial<Query<any>>> = sharedSource$.pipe(
    map((v) => ({ value: v, isLoading: false, isRefreshing: false })),
    startWith({ isLoading: true, isRefreshing: false })
  );

  const refreshedRequest$: Observable<Partial<Query<any>>> = refresh$.pipe(
    switchMap(() =>
      sharedSource$.pipe(
        map((v) => ({ value: v, isLoading: false, isRefreshing: false })),
        startWith({ isLoading: true, isRefreshing: true })
      )
    )
  );

  return merge(request$, refreshedRequest$).pipe(
    scan(
      (acc, curr) => {
        return { ...acc, ...curr };
      },
      { isLoading: false, isRefreshing: false, value: undefined }
    ),
    share({
      connector: () => new ReplaySubject(1),
    })
  );
}
