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
import {combineLatest, distinctUntilChanged, map, Observable, skip, startWith, switchMap, takeWhile, timer} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {deriveSuspenseState} from "@angular-kit/rx-stateful";


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
        StreamDirective,
        RxObserveResizeDirective,
        RxRenderInViewportDirective,
        RxObserveVisibilityDirective,
        AsyncPipe,
        JsonPipe,
    ],
})
export class AppComponent {

    constructor() {
        const http = inject(HttpClient)
        const source = timer(1500).pipe(
            switchMap(() => http.get('https://jsonplaceholder.typicode.com/todos/1'))
        )

        const suspense = deriveSuspenseState(source, 1000)
        suspense.subscribe(x => console.log('suspense', x))


      //nonFlickerLoader(source).subscribe(x => console.log('nonFlickerLoader', x))
    }
}
function nonFlickerLoader<T>(
  data$: Observable<T>,
  delay: number = 1000,
  duration: number = 1000
) {
  const loading$ = timer(delay, duration).pipe(
    map((i) => !i),
    takeWhile<boolean>(Boolean, true),
    startWith(false)
  );

  return combineLatest([data$.pipe(startWith(null)), loading$]).pipe(
    takeWhile(([data, loading]) => !data || loading, true),
    map(([data, loading]) => (loading ? null : data)),
    skip(1),
    distinctUntilChanged(),
    map((value) => value ?? 'Loading...'),
  );
}


