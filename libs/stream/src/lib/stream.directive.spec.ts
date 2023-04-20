import {StreamDirective} from './stream.directive';
import {createHostFactory, SpectatorHost} from '@ngneat/spectator';
import {
  BehaviorSubject,
  delay,
  EMPTY,
  mergeAll,
  Observable,
  of,
  ReplaySubject,
  scan,
  Subject,
  switchMap,
  takeUntil,
  throwError,
} from 'rxjs';
import {TestBed, waitForAsync} from '@angular/core/testing';
import {Component, Injectable, TemplateRef, ViewContainerRef} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {
  injectStreamDirectiveContext,
  provideStreamDirectiveConfig,
  StreamDirectiveConfig
} from './stream-directive-config';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {By} from '@angular/platform-browser';
import {subscribeSpyTo} from '@hirez_io/observer-spy';
import {RenderContext} from "./types/render-context";
import {StreamDirectiveContext} from "./types/stream-directive-context";
import {TestViewContainerRef} from "../__test__/utils/mock-vcr";
import {TestTemplateRef} from "../__test__/utils/mock-templateref";
import {ThrottleRenderStrategy, ViewportRenderStrategy} from "./types/render-strategies";

describe('StreamDirective', () => {
  describe('Basic', () => {
    const hostFactory = createHostFactory(StreamDirective);

    it('should subscribe to source', () => {
      const host = hostFactory(`<div *stream="source; let value">{{ value?.id }}</div>`, {
        hostProps: {
          source: createSource(),
        },
      });
      expect(html(host)).toContain('1');
    });
    describe('context', () => {
      it('should show error context', () => {
        const host = hostFactory(
          `
          <div *stream="
          source;
          let value;
          let error = error;">
           {{ error }}
          </div>
          `,
          {
            hostProps: {
              source: throwError(() => new Error('🔥')),
            },
          }
        );
        expect(html(host)).toContain('🔥');
      });
      it('should show loading context', () => {
        const host = hostFactory(
          `
          <div *stream="
          source;
          let value;
          let loading = loading;">
           loading: {{ loading }}
          </div>
          `,
          {
            hostProps: {
              source: createSource(),
            },
          }
        );
        expect(html(host)).toContain('loading: false');
      });
      it('should show complete context', () => {
        const host = hostFactory(
          `
          <div *stream="
          source;
          let value;
          let complete = completed;">
           complete: {{ complete }}
          </div>
          `,
          {
            hostProps: {
              source: createSource(),
            },
          }
        );
        expect(html(host)).toContain('complete: false');
      });
    });

    describe('Templates', () => {
      it('should show error template', () => {
        const host = hostFactory(
          `
          <div *stream="
          source;
          let value;
          errorTemplate: errorTemplate;
          ">
          </div>

          <ng-template #errorTemplate let-error="error">
            <div>Error: {{ error }}</div>
          </ng-template>
          `,
          {
            hostProps: {
              source: throwError(() => new Error('🔥')),
            },
          }
        );
        expect(html(host)).toContain('Error: 🔥');
      });
      it('should show loading template', () => {
        const refreshSignal = new BehaviorSubject<boolean>(true);
        const host = hostFactory(
          `
          <div *stream="
          source;
          let value;
          loadingTemplate: loadingTemplate;
          refreshSignal: refreshSignal;
          ">
          </div>

           <ng-template #loadingTemplate let-loading="loading">
            <div>Loading... {{ loading }}</div>
          </ng-template>
          `,
          {
            hostProps: {
              source: createSource(),
              refreshSignal,
            },
          }
        );
        refreshSignal.next(true);
        expect(html(host)).toContain('Loading... true');
      });
      // todo
      xit('should show complete template', waitForAsync(() => {
        const host = hostFactory(
          `
          <div *stream="
          source;
          let value;
          completeTemplate: completeTemplate;
          ">
          </div>

          <ng-template #completeTemplate let-complete="completed">
            <div>Complete: {{ complete }}</div>
          </ng-template>
          `,
          {
            hostProps: {
              source: EMPTY,
            },
          }
        );

        expect(html(host)).toContain('Complete: true');
      }));
    });

    describe('keepValueOnLoading', () => {
      it('should keep value on loading when keepValueOnLoading is true', () => {
        const refreshSignal = new BehaviorSubject<boolean>(true);
        const host = hostFactory(
          `
          <div *stream="
          source;
          let value;
          loadingTemplate: loadingTemplate;
          refreshSignal: refreshSignal;
          keepValueOnLoading: true
          ">
          Value: {{ value?.id }}
          </div>
          <ng-template #loadingTemplate let-loading="loading">
            <div>Loading... {{ loading }}</div>
          </ng-template>

          `,
          {
            hostProps: {
              source: createSource(),
              refreshSignal,
            },
          }
        );
        refreshSignal.next(true);
        expect(html(host)).toContain('Value: 1');
      });
      it('should clear value on loading when keepValueOnLoading is false', waitForAsync(() => {
        const refreshSignal = new BehaviorSubject<boolean>(true);
        const host = hostFactory(
          `
          <div *stream="
          source;
          let value;
          loadingTemplate: loadingTemplate;
          refreshSignal: refreshSignal;
          keepValueOnLoading: false
          ">
          Value: {{ value?.id }}
          </div>
       <ng-template #loadingTemplate let-loading="loading">
            <div>Loading... {{ loading }}</div>
          </ng-template>
          `,
          {
            hostProps: {
              source: createSource(),
              refreshSignal,
            },
          }
        );

        refreshSignal.next(true);

        expect(html(host)).not.toContain('Value: 1');
      }));
    });

    describe('renderCallback', () => {
      it('should call renderCallback when value is emitted', () => {
        const renderCallback = new ReplaySubject<RenderContext<TestModel>>();
        const source = new Subject<TestModel>();
        const refreshSignal = new ReplaySubject<boolean>(1);

        const value = createValue();
        const host = hostFactory(
          `
          <div *stream="
          source;
          let value;
          renderCallback: renderCallback;
             refreshSignal: refreshSignal;
          ">
          </div>
          `,
          {
            hostProps: {
              source: source.asObservable(),
              renderCallback,
              refreshSignal,
            },
          }
        );
        const result = subscribeSpyTo(renderCallback.asObservable());
        source.next(value);
        refreshSignal.next(true);

        expect(result.getValues()).toEqual([
          {
            value: value,
            error: undefined,
            renderCycle: 'next',
          },
          {
            value: value,
            error: undefined,
            renderCycle: 'before-next',
          },
        ]);
      });
    });
  });

  describe('Component Configurations', () => {
    it('should create setup', async () => {
      const { component } = await createSetup(createConfig());

      expect(component).toBeDefined();
    });

    it('should show error component', waitForAsync(async () => {
      const { valueProvider, fixture } = await createSetup(createConfig());
      valueProvider.provideErrorSource();
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('div')).nativeElement?.innerHTML).toContain('Error: 🔥');
    }));
    // todo
    xit('should show loading component', waitForAsync(async () => {
      const { valueProvider, fixture } = await createSetup(createConfig());

      valueProvider.provideRefreshSource();

      valueProvider.refreshSignal.next(10);
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('div')).nativeElement?.innerHTML).toContain('Loading... context ');
    }));
    // todo
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    xit('should show complete component', () => {});
  });

  describe('Config', () => {
    describe('keepValueOnLoading', () => {
      it('should be false if config is not set', async () => {
        const { directive } = await setupDirective(createConfig());

        expect(directive.streamKeepValueOnLoading).toEqual(false);
      });
      it('should have config value', async () => {
        const { directive } = await setupDirective(createConfig({keepValueOnLoading: true}));

        expect(directive.streamKeepValueOnLoading).toEqual(true);
      });
    })
    describe('lazyViewCreation', () => {
      it('should be false if config is not set', async () => {
        const { directive } = await setupDirective(createConfig());

        expect(directive.streamLazyViewCreation).toEqual(false);
      });
      it('should have config value', async () => {
        const { directive } = await setupDirective(createConfig({lazyViewCreation: true}));

        expect(directive.streamLazyViewCreation).toEqual(true);
      });
    })
    describe('renderStrategy', () => {
      it('should be DefaultRenderStrategy if config is not set', async () => {
        const { directive } = await setupDirective(createConfig());

        const result = subscribeSpyTo(directive.renderStrategy$);

        expect(result.getLastValue()).toEqual({type: 'default'});
      });

      it('should have config value', async () => {
        const renderStrategy: ThrottleRenderStrategy = {
          type: 'throttle',
          throttleInMs: 100
        }
        const { directive } = await setupDirective(createConfig({renderStrategy}));


        const result = subscribeSpyTo(directive.renderStrategy$);

        expect(result.getLastValue()).toEqual(renderStrategy);
      });

    })

  })

  describe('RenderStrategies', () => {
    describe('renderStrategy$', () => {
      it('should be DefaultRenderStrategy by default', async () => {
        const { directive } = await setupDirective(createConfig());

        const result = subscribeSpyTo(directive.renderStrategy$);

        expect(result.getLastValue()).toEqual({type: 'default'});
      });

      it('should be derived from renderStrategy$$', async () => {
        const { directive } = await setupDirective(createConfig());
        const throttleRenderStrategy: ThrottleRenderStrategy = {
          type: 'throttle',
          throttleInMs: 100
        }
        const viewPortStrategy: ViewportRenderStrategy = {
          type: 'viewport',
          threshold: 10
        }

        const result = subscribeSpyTo(directive.renderStrategy$);

        directive.streamRenderStrategy = throttleRenderStrategy;
        directive.streamRenderStrategy = viewPortStrategy;

        expect(result.getValues()).toEqual([
          {type: 'default'},
          throttleRenderStrategy,
          viewPortStrategy
        ]);
      });
    })

    describe('isViewPortStrategy$', () => {
      it('should be false by default', async () => {
        const { directive } = await setupDirective(createConfig());

        const result = subscribeSpyTo(directive.isViewPortStrategy$);

        expect(result.getLastValue()).toEqual(false);
      });
      it('should be true when ViewPortStrategy is set', async () => {
        const { directive } = await setupDirective(createConfig());

        const result = subscribeSpyTo(directive.isViewPortStrategy$);

        directive.streamRenderStrategy = {
          type: 'viewport',
          threshold: 10
        }

        expect(result.getLastValue()).toEqual(true);
      });
    })

    describe('viewPortObserver$', () => {
      it('should emit null by default', async () => {
        const { directive } = await setupDirective(createConfig());

        const result = subscribeSpyTo(directive.viewPortObserver$);

        expect(result.getLastValue()).toEqual(null);
      });
  /*    it('should emit IntersectionObserver when ViewPortStrategy is set', async () => {
        const { directive } = await setupDirective(createConfig());
        mockIntersectionObserver();
        const result = subscribeSpyTo(directive.viewPortObserver$);

        directive.streamRenderStrategy = {
          type: 'viewport',
          threshold: 10
        }

        (directive as any).viewContainerRef?.element.nativeElement.parentElement.dispatchEvent(new Event('intersect'));

        expect(result.getLastValue()).not.toEqual(null);
      });*/
    })
  });
});

function createSource(cfg?: { data?: Partial<TestModel>; completeSignal?: Subject<boolean> }): Observable<TestModel> {
  return of(createValue(cfg?.data)).pipe(takeUntil(cfg?.completeSignal ?? new Subject<boolean>()));
}

function createValue(cfg?: Partial<TestModel>): TestModel {
  return {
    id: cfg?.id ?? 1,
    name: cfg?.name ?? 'test',
  };
}

interface TestModel {
  id: number;
  name: string;
}

function html(host: SpectatorHost<any>) {
  return host.query('div')?.innerHTML;
}

function createConfig(cfg?: StreamDirectiveConfig): StreamDirectiveConfig{
  const baseConfig = {
    loadingComponent: LoadingComponent,
    errorComponent: ErrorComponent,
  };

  const mergedConfig = {...baseConfig, ...cfg};

  return mergedConfig;
}

async function createSetup(config?: StreamDirectiveConfig) {
  await TestBed.configureTestingModule({
    declarations: [TestHostComponent],
    imports: [HttpClientTestingModule, StreamDirective],
    providers: [
      provideStreamDirectiveConfig(config as StreamDirectiveConfig),
      ValueProvider,
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(TestHostComponent);
  const component = fixture.componentInstance;
  const valueProvider: ValueProvider = TestBed.inject(ValueProvider);

  return {
    fixture,
    component,
    valueProvider,
  };
}

async function setupDirective(config?: StreamDirectiveConfig) {
  await TestBed.configureTestingModule({
    imports: [HttpClientTestingModule, StreamDirective],
    providers: [
      StreamDirective,
      provideStreamDirectiveConfig(config as StreamDirectiveConfig),
      {
        provide: ViewContainerRef,
        useValue: new TestViewContainerRef(),
      },
      {
        provide: TemplateRef,
        useValue: new TestTemplateRef(),
      }
    ],
  }).compileComponents();


  const directive = TestBed.inject(StreamDirective)

  return {
    directive
  };
}

@Injectable({ providedIn: 'root' })
export class ValueProvider {
  sourceProvider$$ = new ReplaySubject<Observable<any>>(1);
  source$ = this.sourceProvider$$.asObservable().pipe(mergeAll());

  refreshSignal = new BehaviorSubject(1);
  refreshSignal$ = this.refreshSignal.pipe(scan((acc, value) => acc + 1, 0));
  constructor(private http: HttpClient) {}
  provideRefreshSource() {
    this.sourceProvider$$.next(this.refreshSignal$.pipe(switchMap((n) => this.getPost(n))));
  }

  provideErrorSource() {
    this.sourceProvider$$.next(throwError(() => new Error('🔥')));
  }

  getPost(n: number) {
    return this.http.get(`https://jsonplaceholder.typicode.com/posts/${n}`).pipe(delay(1000));
  }
}

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'test',
  template: `
    <div
      *stream="
        source$;
        let v;
        let error = error;
        let complete = completed;
        let loading = loading;
        refreshSignal: valueProvider.refreshSignal;
        keepValueOnLoading: true
      "
    >
      Complete {{ complete }}
      <br />
      Error {{ error }}
      <br />
      Loading {{ loading }}
      <br />
      Value: {{ v?.id }}
    </div>
  `,
})
export class TestHostComponent {

  source$ = this.valueProvider.source$;
  constructor(public valueProvider: ValueProvider) {}
}

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'loading',
  template: ` <div>Loading... context {{ context?.loading }}</div> `,
})
export class LoadingComponent {
  public readonly context: StreamDirectiveContext<TestModel> = injectStreamDirectiveContext();

}

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'error',
  template: ` <div>Error: context {{ context?.error }}</div> `,
})
export class ErrorComponent {
  public readonly context: StreamDirectiveContext<TestModel> = injectStreamDirectiveContext();
}


