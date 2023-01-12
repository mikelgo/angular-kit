import {Directive, ElementRef, Input, NgModule, OnDestroy, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Subscription} from 'rxjs';
import {createResizeObserver, ResizeObserverConfig} from '../create-resize-observer';
import {createSignal} from '@code-workers.io/angular-kit/rx/signal';

@Directive({
  selector: '[observeResize]',
})
export class ObserveResizeDirective implements OnDestroy {
  private subscription = new Subscription();
  private configSignal = createSignal<ResizeObserverConfig | null>();

  @Input() set resizeObserverConfig(config: ResizeObserverConfig | null) {
    this.configSignal.send(config);
  }

  private resizeObserver$ = createResizeObserver(this.element);

  @Output() resizeEvent = this.resizeObserver$;

  constructor(private element: ElementRef) {
    this.subscription.add(
      this.configSignal.$.subscribe((config) => {
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
  declarations: [ObserveResizeDirective],
  exports: [ObserveResizeDirective],
})
export class ObserveResizeDirectiveModule {}
