import {ChangeDetectionStrategy, Component, Input} from '@angular/core';

@Component({
  selector: 'angular-kit-l1',
  template: `
  <ngx-dirty-checker></ngx-dirty-checker>
  <div>L1</div>
<!--    <p>
      Value from L1: {{value}}
    </p>-->
    <angular-kit-l2 [value]="value"></angular-kit-l2>
  `,
  styles: [
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class L1Component {
  @Input() value!: any

}
