import {StreamDirective, StreamDirectiveContext} from './stream.directive';
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
import {Component, Inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {STREAM_DIR_CONFIG, STREAM_DIR_CONTEXT} from './stream-directive-config';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {By} from '@angular/platform-browser';

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
  });

  describe('Component Configurations', () => {
    it('should create setup', async () => {
      const { component } = await createSetup();

      expect(component).toBeDefined();
    });

    it('should show error component', waitForAsync(async () => {
      const { valueProvider, fixture } = await createSetup();
      valueProvider.provideErrorSource();
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('div')).nativeElement?.innerHTML).toContain('Error: 🔥');
    }));
    // todo
    xit('should show loading component', waitForAsync(async () => {
      const { valueProvider, fixture } = await createSetup();

      valueProvider.provideRefreshSource();

      valueProvider.refreshSignal.next(10);
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('div')).nativeElement?.innerHTML).toContain('Loading... context ');
    }));
    // todo
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    xit('should show complete component', () => {});
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

async function createSetup() {
  await TestBed.configureTestingModule({
    declarations: [StreamDirective, TestHostComponent],
    imports: [HttpClientTestingModule],
    providers: [
      {
        provide: STREAM_DIR_CONFIG,
        useValue: {
          loadingComponent: LoadingComponent,
          errorComponent: ErrorComponent,
        },
      },
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
  constructor(@Inject(STREAM_DIR_CONTEXT) public readonly context: StreamDirectiveContext<TestModel>) {}
}

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'error',
  template: ` <div>Error: context {{ context?.error }}</div> `,
})
export class ErrorComponent {
  constructor(@Inject(STREAM_DIR_CONTEXT) public readonly context: StreamDirectiveContext<TestModel>) {}
}
