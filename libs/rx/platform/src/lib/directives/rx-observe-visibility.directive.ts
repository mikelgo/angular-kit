import {Directive, ElementRef, EventEmitter, Input, NgModule, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {combineLatest, mergeMap, SchedulerLike, startWith, Subscription} from "rxjs";
import {createStream} from '@angular-kit/rx/streams';
import {createIntersectionObserver} from "../create-intersection-observer";


export type IntersectionStatus = 'Visible' | 'Hidden';

@Directive({
  selector: '[rxObserveVisibility]',
})
export class RxObserveVisibilityDirective {
  private sub = new Subscription();
  private rxObserveVisibilityDebounceSignal = createStream(0);
  private rxObserveVisibilityRootMarginSignal = createStream('0px');
  private rxObserveVisibilityRootSignal =  createStream<HTMLElement | undefined>(undefined);
  private rxObserveVisibilityThresholdSignal =  createStream<number | number[]>(0);
  private rxObserveVisibilitySchedulerSignal =  createStream<SchedulerLike | undefined>(undefined);

  @Input() set rxObserveVisibilityDebounce(debounceInMs: number){
    this.rxObserveVisibilityDebounceSignal.send(debounceInMs);
  }
  @Input() set rxObserveVisibilityRootMargin(rootMargin: string) {
    this.rxObserveVisibilityRootMarginSignal.send(rootMargin);
  }
  @Input() set rxObserveVisibilityRoot(root: HTMLElement | undefined) {
    this.rxObserveVisibilityRootSignal.send(root);
  }
  @Input() set rxObserveVisibilityThreshold(threshold: number | number[]) {
    this.rxObserveVisibilityThresholdSignal.send(threshold);
  }
  @Input() set rxObserveVisibilityScheduler(scheduler: SchedulerLike) {
    this.rxObserveVisibilitySchedulerSignal.send(scheduler);
  }

  @Output() intersectStatusChange = new EventEmitter<IntersectionStatus>();

  constructor(private element: ElementRef) {
    this.sub = combineLatest([
      this.rxObserveVisibilityDebounceSignal.$.pipe(startWith(0)),
      this.rxObserveVisibilityRootMarginSignal.$.pipe(startWith('0px')),
      this.rxObserveVisibilityRootSignal.$.pipe(startWith(undefined)),
      this.rxObserveVisibilityThresholdSignal.$.pipe(startWith(0)),
      this.rxObserveVisibilitySchedulerSignal.$.pipe(startWith(undefined)),
    ]).pipe(
      mergeMap(([debounceInMs, rootMargin, root, threshold, scheduler]) => createIntersectionObserver(this.element, {
        root: root,
        rootMargin: rootMargin,
        threshold: threshold,
      }, {
        throttleMs: debounceInMs,
        scheduler: scheduler
      }))
    ).subscribe((entries) => {
      const entry = entries[0];
      if (entry.isIntersecting) {
        this.intersectStatusChange.emit('Visible');
      }

      /* if (entry.intersectionRatio > 0 && entry.intersectionRatio < 1) {
         this.visibilityChange.emit('Pending');
       }*/

      if(!entry.isIntersecting){
        this.intersectStatusChange.emit('Hidden');
      }
    })
  }
}

@NgModule({
  imports: [CommonModule],
  declarations: [RxObserveVisibilityDirective],
  exports: [RxObserveVisibilityDirective],
})
export class RxObserveVisibilityDirectiveModule {}
