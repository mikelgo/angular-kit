import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'angular-kit-l2',
  template: `
    <ngx-dirty-checker></ngx-dirty-checker>
    <div>L2</div>
    <p>Value from L1: {{ value }}</p>
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
export class L2Component {
  @Input() value!: any;
}
