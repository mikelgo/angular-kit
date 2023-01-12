import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Observable} from 'rxjs';

@Component({
  selector: 'angular-kit-l2-stream',
  template: `
    <div>
      <ngx-dirty-checker></ngx-dirty-checker>
      <span>L2 Component</span>
    </div>
    <p *stream="value; let v;" class="embedded">
      Value from L2: {{ v }}

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
      .count {
        border: 1px solid green;
        border-radius: 100%;
        width: 40px;
        height: 40px;
        display: inline-flex;
        justify-content: center;
        align-items: center;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class L2StreamComponent {
  @Input() value!: Observable<any>;
}
