import {ChangeDetectionStrategy, Component} from '@angular/core';
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
import {delay, of, race, startWith, switchMap, take, timer} from "rxjs";


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


        const source$ = of('value').pipe(
            delay(1500)
        )

        const delayed$ = timer(1250).pipe(
            take(1),
            switchMap(() => source$),
            startWith('suspense'),
            //delay()
        )

        //delayed$.subscribe(console.log)
        //source$.subscribe(console.log)

        const merged$ = race(delayed$, source$)

        merged$.subscribe(console.log)
    }
}
