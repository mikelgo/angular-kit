import {ChangeDetectionStrategy, Component} from '@angular/core';
import {AsyncPipe, JsonPipe} from '@angular/common';
import {
    RxObserveVisibilityDirective
} from '../../../../libs/rx/platform/src/lib/directives/rx-observe-visibility.directive';
import {
    RxRenderInViewportDirective
} from '../../../../libs/rx/platform/src/lib/directives/rx-render-in-view-port.directive';
import {RxObserveResizeDirective} from '../../../../libs/rx/platform/src/lib/directives/rx-observe-resize.directive';
import {StreamDirective} from '../../../../libs/stream/src/lib/stream.directive';
import {DemoOnchangesComponent} from './demo-onchanges/demo-onchanges.component';
import {RouterOutlet} from '@angular/router';
import {NavComponent} from './core/nav.component';


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
}
