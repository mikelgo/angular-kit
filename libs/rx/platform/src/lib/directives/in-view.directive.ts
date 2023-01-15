import {Directive, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

@Directive({
  selector: '[inView]',
})
export class InViewDirective {
  constructor() {}
}

@NgModule({
  imports: [CommonModule],
  declarations: [InViewDirective],
  exports: [InViewDirective],
})
export class InViewDirectiveModule {}
