import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'angular-kit-l2-stream',
  template: `
    <ngx-dirty-checker></ngx-dirty-checker>
    <div>L2</div>
    <p *stream="value; let v" class="embedded">
      <ngx-dirty-checker></ngx-dirty-checker>
      Value from L2: {{ v }}
    </p>
  `,
  styles: [
    `
      :host {
        display: block;
        border: 1px dashed darkseagreen;
        width: 200px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class L2StreamComponent {
  @Input() value!: Observable<any>;
}
