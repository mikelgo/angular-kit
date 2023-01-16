import {
  AfterViewInit,
  Directive,
  EmbeddedViewRef,
  Input,
  NgModule,
  OnDestroy,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {debounceTime, filter, Observable, Subject, Subscription} from "rxjs";

@Directive({
  selector: '[rxInView]',
})
export class RxInViewDirective implements AfterViewInit, OnDestroy {
  alreadyRendered: boolean = false; // cheking if visible already
  embeddedViewRef: EmbeddedViewRef<unknown> | null = null;

  private sub = new Subscription();
  @Input() inView: any = null;
  @Input() inViewDebounce = 250;
  @Input() inViewRootMargin = '0px';
  //@Input() inViewRoot: HTMLElement | undefined;
  @Input() inViewThreshold: number | number[] = 0;

  constructor(
    private vcRef: ViewContainerRef,
    private tplRef: TemplateRef<unknown>
  ) {}

  ngAfterViewInit() {
    const commentEl = this.vcRef.element.nativeElement; // template
    const elToObserve = commentEl.parentElement;
    const config = {
      //root: this.intersectionRoot,
      rootMargin: this.inViewRootMargin,
      threshold: this.inViewThreshold,
    };
    this.setMinWidthHeight(elToObserve);

    this.sub = fromIntersectionObserver(elToObserve, config, this.inViewDebounce)
      .pipe()
      .subscribe((status) => {
        this.renderContents(status === 'Visible');
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

  setMinWidthHeight(el: HTMLElement) {
    // prevent issue being visible all together
    const style = window.getComputedStyle(el);
    const [width, height] = [parseInt(style.width), parseInt(style.height)];
    !width && (el.style.minWidth = '40px');
    !height && (el.style.minHeight = '40px');
  }
}

@NgModule({
  imports: [CommonModule],
  declarations: [RxInViewDirective],
  exports: [RxInViewDirective],
})
export class RxInViewDirectiveModule {}

export enum IntersectionStatus {
  Visible = 'Visible',
  Pending = 'Pending',
  NotVisible = 'NotVisible'
}

export const fromIntersectionObserver = (
  element: HTMLElement,
  config: IntersectionObserverInit,
  debounce = 0
) =>
  new Observable<IntersectionStatus>(subscriber => {
    const subject$ = new Subject<{
      entry: IntersectionObserverEntry;
      observer: IntersectionObserver;
    }>();

    const intersectionObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach(entry => {
          /*   if (isIntersecting(entry)) {
               subject$.next({ entry, observer });
             }*/
          // with this we also get notified when element is hidden
          subject$.next({ entry, observer });
        });
      },
      config
    );

    subject$.subscribe(() => {
      subscriber.next(IntersectionStatus.Pending);
    });

    subject$
      .pipe(
        debounceTime(debounce),
        filter(Boolean)
      )
      .subscribe(async ({ entry, observer }) => {
        const isEntryVisible = await isVisible(entry.target as HTMLElement);

        if (isEntryVisible) {
          subscriber.next(IntersectionStatus.Visible);
          //observer.unobserve(entry.target);
        } else {
          subscriber.next(IntersectionStatus.NotVisible);
        }
      });

    intersectionObserver.observe(element);

    return {
      unsubscribe() {
        intersectionObserver.disconnect();
        subject$.unsubscribe();
      }
    };
  });

async function isVisible(element: HTMLElement) {
  return new Promise(resolve => {
    const observer = new IntersectionObserver(([entry]) => {
      resolve(entry.isIntersecting);
      //observer.disconnect();
    });

    observer.observe(element);
  });
}

