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
import {switchMap, timer} from "rxjs";
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
        const source = timer(600).pipe(
            switchMap(() => http.get('https://jsonplaceholder.typicode.com/todos/1'))
        )

        const suspense = deriveSuspenseState(source)
        suspense.subscribe(x => console.log('suspense', x))
    }
}


