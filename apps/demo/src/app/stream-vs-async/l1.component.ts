import {ChangeDetectionStrategy, Component, Input} from '@angular/core';

@Component({
  selector: 'angular-kit-l1',
  template: `
    <div>
      <ngx-dirty-checker></ngx-dirty-checker>
      <span>L1 Component</span>
    </div>
    <!--    <p>
      Value from L1: {{value}}
    </p>-->
    <angular-kit-l2 [value]="value"></angular-kit-l2>
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
export class L1Component {
  @Input() value!: any;
}
