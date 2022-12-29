import {ChangeDetectionStrategy, Component, Input} from '@angular/core';

@Component({
  selector: 'angular-kit-l2',
  template: `
    <ngx-dirty-checker></ngx-dirty-checker>
    <div>L2</div>
    <p>
      Value from L1: {{value}}
    </p>
  `,
  styles: [
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class L2Component {
  @Input() value!: any

}
