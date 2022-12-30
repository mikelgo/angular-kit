import {
  Directive,
  EmbeddedViewRef,
  Inject,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import {
  distinctUntilChanged,
  filter,
  mergeAll,
  Observable,
  ReplaySubject,
  startWith,
  Subject,
  Subscription,
  Unsubscribable,
  withLatestFrom,
} from 'rxjs';

import { STREAM_DIR_CONFIG, STREAM_DIR_CONTEXT, StreamDirectiveConfig } from './stream-directive-config';

export interface StreamDirectiveContext<T> {
  $implicit: T | null;
  stream: T | null;
  error: any;
  completed: boolean;
  loading: boolean;
}

@Directive({
  selector: '[stream]',
})
export class StreamDirective<T> implements OnInit, OnDestroy {
  private source$$ = new ReplaySubject<Observable<any>>(1);
  private refreshEffect$$ = new ReplaySubject<Subject<any>>(1);
  private loadingTemplate$$ = new ReplaySubject<TemplateRef<StreamDirectiveContext<T>>>(1);

  private detach = true;

  @Input() set stream(source: Observable<any>) {
    if (source) {
      this.source$$.next(source);
    }
  }

  @Input() set streamRefreshSignal(refreshEffect: Subject<any>) {
    if (refreshEffect) {
      this.refreshEffect$$.next(refreshEffect);
    }
  }

  @Input() set streamLoadingTemplate(tpl: TemplateRef<StreamDirectiveContext<T>>) {
    if (tpl) {
      this.loadingTemplate$$.next(tpl);
    }
  }

  @Input() streamErrorTemplate: TemplateRef<StreamDirectiveContext<T>> | undefined;
  @Input() streamCompleteTemplate: TemplateRef<StreamDirectiveContext<T>> | undefined;
  @Input() streamKeepValueOnLoading = false;

  private subscription: Unsubscribable = new Subscription();
  private embeddedView!: EmbeddedViewRef<any>;

  private context: StreamDirectiveContext<T> = {
    $implicit: null,
    stream: null,
    error: undefined,
    completed: false,
    loading: false,
  };

  static ngTemplateContextGuard<T>(
    directive: StreamDirective<T>,
    context: unknown
  ): context is StreamDirectiveContext<T> {
    return true;
  }

  constructor(
    private readonly templateRef: TemplateRef<StreamDirectiveContext<T>>,
    private readonly viewContainerRef: ViewContainerRef,
    @Optional() @Inject(STREAM_DIR_CONFIG) private readonly config: StreamDirectiveConfig
  ) {}

  ngOnInit(): void {
    if (!this.embeddedView) {
      this.createEmbeddedView();
    }
    this.refreshEffect$$
      .pipe(distinctUntilChanged(), mergeAll(), withLatestFrom(this.loadingTemplate$$.pipe(startWith(null))))
      .subscribe(([_, loadingTemplate]) => {
        this.context.loading = true;
        if (!this.streamKeepValueOnLoading) {
          this.viewContainerRef.clear();
        }

        if (this.config?.loadingComponent) {
          this.viewContainerRef.createComponent(this.config.loadingComponent, {
            injector: this.createInjector(),
          });
        } else {
          this.embeddedView = this.viewContainerRef.createEmbeddedView(
            loadingTemplate || this.templateRef,
            this.context
          );
        }

        this.embeddedView.detectChanges();
      });
    this.subscription = this.source$$
      .pipe(
        distinctUntilChanged(),
        mergeAll(),
        distinctUntilChanged(),
        filter((v) => v !== undefined)
      )
      .subscribe({
        next: (v) => {
          this.context.$implicit = v;
          this.context.stream = v;
          this.context.loading = false;
          this.viewContainerRef.clear();

          this.embeddedView = this.viewContainerRef.createEmbeddedView(this.templateRef, this.context);

          this.embeddedView.detectChanges();
        },
        error: (err) => {
          this.context.error = err;
          this.viewContainerRef.clear();
          if (this.config?.errorComponent) {
            this.viewContainerRef.createComponent(this.config.errorComponent, {
              injector: this.createInjector(),
            });
          } else {
            this.embeddedView = this.viewContainerRef.createEmbeddedView(
              this.streamErrorTemplate || this.templateRef,
              this.context
            );
          }

          this.embeddedView.detectChanges();
        },
        complete: () => {
          this.context.completed = true;
          this.viewContainerRef.clear();
          if (this.config?.completeComponent) {
            this.viewContainerRef.createComponent(this.config.completeComponent, {
              injector: this.createInjector(),
            });
          } else {
            this.embeddedView = this.viewContainerRef.createEmbeddedView(
              this.streamCompleteTemplate || this.templateRef,
              this.context
            );
          }

          this.embeddedView.detectChanges();
        },
      });
  }

  private createInjector() {
    return Injector.create({
      providers: [
        {
          provide: STREAM_DIR_CONTEXT,
          useValue: this.context,
        },
      ],
    });
  }

  ngOnDestroy(): void {
    this.viewContainerRef.clear();
    this.subscription.unsubscribe();
  }

  private createEmbeddedView(): void {
    this.embeddedView = this.viewContainerRef.createEmbeddedView(this.templateRef, this.context);
    if (this.detach) {
      this.embeddedView.detach();
    }
  }
}
