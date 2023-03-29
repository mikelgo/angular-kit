import {
  AfterViewInit,
  Directive,
  EmbeddedViewRef,
  Input,
  NgModule,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {combineLatest, mergeMap, SchedulerLike, startWith, Subscription} from 'rxjs';
import {createStream} from '@angular-kit/rx/streams';
import {createIntersectionObserver} from '../create-intersection-observer';

@Directive({
  selector: '[rxRenderInViewport]',
})
export class RxRenderInViewportDirective implements AfterViewInit, OnDestroy {
  private alreadyRendered = false; // cheking if visible already
  private embeddedViewRef: EmbeddedViewRef<unknown> | null = null;
  private sub = new Subscription();

  private rxObserveVisibilityDebounceSignal = createStream(0);
  private rxObserveVisibilityRootMarginSignal = createStream('0px');
  private rxObserveVisibilityRootSignal = createStream<HTMLElement | undefined>(undefined);
  private rxObserveVisibilityThresholdSignal = createStream<number | number[]>(0);
  private rxObserveVisibilitySchedulerSignal = createStream<SchedulerLike | undefined>(undefined);

  @Input() set rxRenderInViewport(rootMargin: string) {
    this.rxObserveVisibilityRootMarginSignal.send(rootMargin);
  }
  @Input() set rxRenderInViewportDebounce(debounceInMs: number) {
    this.rxObserveVisibilityDebounceSignal.send(debounceInMs);
  }
  @Input() set rxRenderInViewportRoot(root: HTMLElement | undefined) {
    this.rxObserveVisibilityRootSignal.send(root);
  }
  @Input() set rxRenderInViewportThreshold(threshold: number | number[]) {
    this.rxObserveVisibilityThresholdSignal.send(threshold);
  }
  @Input() set rxRenderInViewportScheduler(scheduler: SchedulerLike) {
    this.rxObserveVisibilitySchedulerSignal.send(scheduler);
  }

  constructor(private vcRef: ViewContainerRef, private tplRef: TemplateRef<unknown>) {}

  ngAfterViewInit() {
    this.sub = combineLatest([
      this.rxObserveVisibilityDebounceSignal.$.pipe(startWith(0)),
      this.rxObserveVisibilityRootMarginSignal.$.pipe(startWith('0px')),
      this.rxObserveVisibilityRootSignal.$.pipe(startWith(undefined)),
      this.rxObserveVisibilityThresholdSignal.$.pipe(startWith(0)),
      this.rxObserveVisibilitySchedulerSignal.$.pipe(startWith(undefined)),
    ])
      .pipe(
        mergeMap(([debounceInMs, rootMargin, root, threshold, scheduler]) =>
          createIntersectionObserver(
            this.vcRef.element.nativeElement.parentElement,
            {
              root: root,
              rootMargin: rootMargin,
              threshold: threshold,
            },
            {
              throttleMs: debounceInMs,
              scheduler: scheduler,
            }
          )
        )
      )
      .subscribe((entries) => {
        const entry = entries[0];
        this.renderContents(entry.isIntersecting);
      });
  }

  ngOnDestroy() {
    this.embeddedViewRef?.destroy();
    this.vcRef?.clear();
    this.sub.unsubscribe();
  }

  renderContents(isInView: boolean) {
    if (isInView && !this.alreadyRendered) {
      this.vcRef.clear();
      this.embeddedViewRef = this.vcRef.createEmbeddedView(this.tplRef);
      this.embeddedViewRef.detectChanges();
      this.alreadyRendered = true;
    }
  }
}

@NgModule({
  imports: [CommonModule],
  declarations: [RxRenderInViewportDirective],
  exports: [RxRenderInViewportDirective],
})
export class RxRenderInViewportDirectiveModule {}
