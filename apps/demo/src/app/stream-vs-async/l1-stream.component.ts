import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Observable} from 'rxjs';

@Component({
  selector: 'angular-kit-l1-stream',
  template: `
    <div>
      <ngx-dirty-checker></ngx-dirty-checker>
      <span>L1 Component</span>
    </div>
    <!--    <p *stream="value; let v;"     >
      Value from L1: {{v}}
    </p>-->
    <angular-kit-l2-stream [value]="value"></angular-kit-l2-stream>
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
})
export class L1StreamComponent {
  @Input() value!: Observable<any>;
}
