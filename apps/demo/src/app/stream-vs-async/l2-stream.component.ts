import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Observable} from "rxjs";

@Component({
  selector: 'angular-kit-l2-stream',
  template: `
    <ngx-dirty-checker></ngx-dirty-checker>
    <div>L2</div>
    <p *stream="value; let v;"     >
      Value from L2: {{v}}
    </p>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class L2StreamComponent {
  @Input() value!: Observable<any>
}
