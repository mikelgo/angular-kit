import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {AsyncPipe, JsonPipe} from '@angular/common';
import {
    RxObserveVisibilityDirective
} from '../../../../libs/rx/platform/src/lib/directives/rx-observe-visibility.directive';
import {
    RxRenderInViewportDirective
} from '../../../../libs/rx/platform/src/lib/directives/rx-render-in-view-port.directive';
import {RxObserveResizeDirective} from '../../../../libs/rx/platform/src/lib/directives/rx-observe-resize.directive';
import {StreamDirective} from '@angular-kit/stream';
import {DemoOnchangesComponent} from './demo-onchanges/demo-onchanges.component';
import {RouterOutlet} from '@angular/router';
import {NavComponent} from './core/nav.component';
import {catchError, delay, map, Observable, of, race, shareReplay, startWith, timer} from "rxjs";
import {HttpClient} from "@angular/common/http";


@Component({
    selector: 'angular-kit-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        NavComponent,
        RouterOutlet,
        DemoOnchangesComponent,
        RxObserveResizeDirective,
        RxRenderInViewportDirective,
        RxObserveVisibilityDirective,
        AsyncPipe,
        JsonPipe,
    ],
})
export class AppComponent {

    constructor() {

    }
}
interface Query<T> {
    value: T | null;
    state: 'loading' | 'resolved' | 'error' | 'refreshing';
}

function createQuery$<T>(
    source: Observable<T>,
    delayInMs: number = 300,
    suspenseStateMs: number = 2000
): Observable<Query<T>> {
    const timer$ = timer(delayInMs)
    const timerDone$ = timer(suspenseStateMs + delayInMs)

    const sharedSource: Observable<Query<T>> = source.pipe(
        map((v) => ({ value: v, state: 'resolved' } as Query<T>)),
        catchError((err) => of({ value: null, state: 'error' } as Query<T>)),
        shareReplay(1)
    );
    const delayLoadingState: Observable<Query<T>> = sharedSource.pipe(
        startWith({ value: null, state: 'loading' } as Query<T>),
        delay(delayInMs)
    );



    return race(sharedSource, delayLoadingState);
}

/**
 * export class AppComponent {
 *   readonly load$ = new Subject<void>();
 *
 *   readonly cancel$ = new Subject<void>();
 *
 *   readonly data$ = this.load$.pipe(
 *     switchMapTo(nonFlickerLoader(this.dataService.load())),
 *     map((value) => value ?? 'Loading...'),
 *     startWith('No data'),
 *     takeUntil(this.cancel$),
 *     repeat()
 *     //tap(console.log)
 *   );
 *
 *   constructor(private readonly dataService: DataService) {}
 * }
 *
 * function nonFlickerLoader<T>(
 *   data$: Observable<T>,
 *   delay: number = 1000,
 *   duration: number = 1000
 * ): Observable<T | null> {
 *   const loading$ = timer(delay, duration).pipe(
 *     map((i) => !i),
 *     takeWhile<boolean>(Boolean, true),
 *     startWith(false)
 *   );
 *
 *   return combineLatest([data$.pipe(startWith(null)), loading$]).pipe(
 *     takeWhile(([data, loading]) => !data || loading, true),
 *     map(([data, loading]) => (loading ? null : data)),
 *     skip(1),
 *     distinctUntilChanged(),
 *     tap(console.log)
 *   );
 * }
 * @param source
 * @param delayInMs
 */
function createQuery<T>(
    source: Observable<T>,
    delayInMs: number = 300
): Observable<Query<T>> {
    const sharedSource: Observable<Query<T>> = source.pipe(
        map((v) => ({ value: v, state: 'resolved' } as Query<T>)),
        catchError((err) => of({ value: null, state: 'error' } as Query<T>)),
        shareReplay(1)
    );
    const delayLoadingState: Observable<Query<T>> = sharedSource.pipe(
        startWith({ value: null, state: 'loading' } as Query<T>),
        delay(delayInMs)
    );

    return race(sharedSource, delayLoadingState);
}
