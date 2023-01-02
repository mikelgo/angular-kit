import {ChangeDetectionStrategy, Component, Input} from '@angular/core';

@Component({
  selector: 'angular-kit-l2',
  template: `
    <div>
      <ngx-dirty-checker></ngx-dirty-checker>
      <span>L2 Component</span>
    </div>
    <p>Value from L2: {{ value }}</p>
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
export class L2Component {
  @Input() value!: any;
}
