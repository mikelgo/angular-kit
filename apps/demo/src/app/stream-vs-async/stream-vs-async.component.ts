import { ChangeDetectionStrategy, Component } from '@angular/core';
import {scan, Subject} from "rxjs";

@Component({
  selector: 'angular-kit-stream-vs-async',
  template: `
  <div>
    <ngx-dirty-checker></ngx-dirty-checker>
    <button (click)="value$$.next(1)">value</button></div>
  <div>
    <div>
      async
      <div>
        <angular-kit-l1 [value]="value$ | async"></angular-kit-l1>
      </div>
    </div>
    <div>stream
      <div>
        <angular-kit-l1-stream [value]="value$"></angular-kit-l1-stream>
      </div>
    </div>
  </div>
  `,
  styleUrls: ['./stream-vs-async.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StreamVsAsyncComponent {
  value$$ = new Subject<number>();
  value$ = this.value$$.pipe(
    scan((acc, value) => acc + 1, 0)
  );

}
