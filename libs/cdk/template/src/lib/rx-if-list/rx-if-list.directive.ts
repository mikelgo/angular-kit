import {Directive, Input, NgModule, TemplateRef, ViewContainerRef} from '@angular/core';
import {CommonModule} from '@angular/common';

@Directive({
  selector: '[rxIfList]',
})
export class RxIfListDirective {
  @Input() set rxIfList(value: ArrayLike<unknown> | null | undefined) {
    this.vcr.clear();
    if ((value?.length ?? []) > 0) {
      this.vcr.createEmbeddedView(this.tpl);
    }
  }
  constructor(
    private readonly vcr: ViewContainerRef,
    private readonly tpl: TemplateRef<unknown>
  ) {}
}

@NgModule({
  imports: [CommonModule],
  declarations: [RxIfListDirective],
  exports: [RxIfListDirective],
})
export class RxIfListDirectiveModule {}
