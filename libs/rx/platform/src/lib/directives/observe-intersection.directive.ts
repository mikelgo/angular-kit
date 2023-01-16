import {Directive, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

@Directive({
  selector: '[observeIntersection]',
})
export class ObserveIntersectionDirective {
  // todo
  // siehe angular-collection
  // evtl auch inview directive portieren
  constructor() {}
}

@NgModule({
  imports: [CommonModule],
  declarations: [ObserveIntersectionDirective],
  exports: [ObserveIntersectionDirective],
})
export class ObserveIntersectionDirectiveModule {}
