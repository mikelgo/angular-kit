import {Directive, ElementRef, EventEmitter, Input, NgModule, OnDestroy, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {combineLatest, mergeMap, SchedulerLike, startWith, Subscription} from 'rxjs';
import {createIntersectionObserver} from '../create-intersection-observer';
import {createStream} from '@angular-kit/rx/streams';

@Directive({
  selector: '[rxObserveIntersection]',
})
export class RxObserveIntersectionDirective implements OnDestroy {
  private sub = new Subscription();
  private rxObserveIntersectionDebounceSignal = createStream<number>(0);
  private rxObserveIntersectionRootMarginSignal = createStream<string>('0px');
  private rxObserveIntersectionRootSignal = createStream<HTMLElement | undefined>(undefined);
  private rxObserveIntersectionThresholdSignal = createStream<number | number[]>(0);
  private rxObserveIntersectionSchedulerSignal = createStream<SchedulerLike | undefined>(undefined);

  @Input() set rxObserveIntersectionDebounce(debounceInMs: number) {
    this.rxObserveIntersectionDebounceSignal.send(debounceInMs);
  }
  @Input() set rxObserveIntersectionRootMargin(rootMargin: string) {
    this.rxObserveIntersectionRootMarginSignal.send(rootMargin);
  }
  @Input() set rxObserveIntersectionRoot(root: HTMLElement | undefined) {
    this.rxObserveIntersectionRootSignal.send(root);
  }
  @Input() set rxObserveIntersectionThreshold(threshold: number | number[]) {
    this.rxObserveIntersectionThresholdSignal.send(threshold);
  }
  @Input() set rxObserveIntersectionScheduler(scheduler: SchedulerLike) {
    this.rxObserveIntersectionSchedulerSignal.send(scheduler);
  }

  @Output() intersect = new EventEmitter<IntersectionObserverEntry[]>();

  constructor(private element: ElementRef) {
    this.sub = combineLatest([
      this.rxObserveIntersectionDebounceSignal.$.pipe(startWith(0)),
      this.rxObserveIntersectionRootMarginSignal.$.pipe(startWith('0px')),
      this.rxObserveIntersectionRootSignal.$.pipe(startWith(undefined)),
      this.rxObserveIntersectionThresholdSignal.$.pipe(startWith(0)),
      this.rxObserveIntersectionSchedulerSignal.$.pipe(startWith(undefined)),
    ])
      .pipe(
        mergeMap(([debounce, rootMargin, root, threshold, scheduler]) =>
          createIntersectionObserver(
            this.element,
            {
              root: root,
              rootMargin: rootMargin,
              threshold: threshold,
            },
            {
              throttleMs: debounce,
              scheduler: scheduler,
            }
          )
        )
      )
      .subscribe((entries) => {
        this.intersect.emit(entries);
      });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}

@NgModule({
  imports: [CommonModule],
  declarations: [RxObserveIntersectionDirective],
  exports: [RxObserveIntersectionDirective],
})
export class RxObserveIntersectionDirectiveModule {}
