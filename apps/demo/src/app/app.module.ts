import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {NxWelcomeComponent} from './nx-welcome.component';

import {HttpClientModule} from '@angular/common/http';
import {L1Component} from './stream-vs-async/l1.component';
import {L2Component} from './stream-vs-async/l2.component';
import {NgxDirtyCheckerModule} from '@code-workers.io/ngx-dirty-checker';
import {StreamVsAsyncComponent} from './stream-vs-async/stream-vs-async.component';
import {L1StreamComponent} from './stream-vs-async/l1-stream.component';
import {L2StreamComponent} from './stream-vs-async/l2-stream.component';
import {
  RxObserveIntersectionDirective,
  RxObserveResizeDirective,
  RxRenderInViewportDirective,
} from '@angular-kit/rx/platform';
import {StreamDirective} from '@angular-kit/stream';
import {
  RxObserveVisibilityDirective
} from '../../../../libs/rx/platform/src/lib/directives/rx-observe-visibility.directive';
import {DemoOnchangesComponent} from './demo-onchanges/demo-onchanges.component';

@NgModule({
  declarations: [
    AppComponent,
    NxWelcomeComponent,
    L1Component,
    L2Component,
    StreamVsAsyncComponent,
    L1StreamComponent,
    L2StreamComponent,
  ],
  imports: [
    BrowserModule,
    StreamDirective,
    HttpClientModule,
    NgxDirtyCheckerModule,
    RxObserveResizeDirective,
    RxObserveIntersectionDirective,
    RxObserveVisibilityDirective,
    RxObserveVisibilityDirective,
    RxRenderInViewportDirective,
    DemoOnchangesComponent,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
