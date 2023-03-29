import {Directive, ElementRef, Input, NgModule, OnDestroy, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Subscription} from 'rxjs';
import {createResizeObserver, ResizeObserverConfig} from '../create-resize-observer';
import {createStream} from '@angular-kit/rx/streams';
import {Nullable} from '@angular-kit/cdk/types';

@Directive({
  selector: '[rxObserveResize]',
})
export class RxObserveResizeDirective implements OnDestroy {
  private subscription = new Subscription();
  private configSignal = createStream<ResizeObserverConfig | null>();

  @Input() set rxObserveResizeConfig(config: ResizeObserverConfig | null) {
    this.configSignal.send(config);
  }

  private resizeObserver$ = createResizeObserver(this.element);

  @Output() resizeEvent = this.resizeObserver$;

  constructor(private element: ElementRef) {
    this.subscription.add(
      this.configSignal.$.subscribe((config: Nullable<ResizeObserverConfig>) => {
        this.resizeObserver$ = createResizeObserver(this.element, config ?? undefined);
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}

@NgModule({
  imports: [CommonModule],
  declarations: [RxObserveResizeDirective],
  exports: [RxObserveResizeDirective],
})
export class RxObserveResizeDirectiveModule {}
