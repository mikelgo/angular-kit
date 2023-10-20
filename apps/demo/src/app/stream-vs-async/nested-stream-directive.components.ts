import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {NgxDirtyCheckerModule} from '@code-workers.io/ngx-dirty-checker';
import {StreamDirective} from "@angular-kit/stream";
import {ReplaySubject} from "rxjs";


@Component({
  selector: 'l2-nested-stream',
  template: `
    <div>
      <ngx-dirty-checker></ngx-dirty-checker>
      <span>L2 Component</span>
    </div>
    <p *stream="value$; let v; let count=renderCount">
      Value from L2: {{ v }}
      <span class="count">{{ count }}</span>
    </p>
  `,
  styles: [
    `
      :host {
        display: block;
        border: 1px dashed darkseagreen;
        width: 200px;
        padding: 16px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgxDirtyCheckerModule, StreamDirective],
})
export class L2Component {
  value$ = new ReplaySubject(1)
  @Input() set value(v: any){
    this.value$.next(v)
  }
}
@Component({
  selector: 'l1-nested-stream',
  template: `
    <div>
      <ngx-dirty-checker></ngx-dirty-checker>
      <span>L1 Component</span>
    </div>
    <!--    <p>
      Value from L1: {{value}}
    </p>-->
    <l2-nested-stream *stream="value$; let v; let count=renderCount" [value]="v">
      <span class="count">{{ count }}</span>
    </l2-nested-stream>
  `,
  styles: [
    `
      :host {
        display: block;
        border: 1px dashed darkseagreen;
        width: 200px;
        padding: 16px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgxDirtyCheckerModule, L2Component, StreamDirective],
})
export class L1Component {
  value$ = new ReplaySubject(1)
  @Input() set value(v: any){
    this.value$.next(v)
  }
}


