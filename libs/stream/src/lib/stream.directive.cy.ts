import {StreamDirective} from "./stream.directive";
import {TestBed} from "@angular/core/testing";
import {provideStreamDirectiveConfig, StreamDirectiveConfig} from "./stream-directive-config";
import {MountConfig} from "cypress/angular";
import {ChangeDetectionStrategy, Component, Input} from "@angular/core";
import {BehaviorSubject, ReplaySubject, scan, Subject} from "rxjs";
import {
  DebounceRenderStrategy,
  RenderStrategy,
  ThrottleRenderStrategy,
  ViewportRenderStrategy
} from "./types/render-strategies";

const TEST_ELEMENT_ID = 'test-element';
const INCREMENT_BUTTON_ID = 'increment-button';
const ID_DEFAULT_STRATEGY = 'btn-default-strategy'
const ID_THROTTLE_STRATEGY = 'btn-throttle-strategy'
const ID_DEBOUNCE_STRATEGY = 'btn-debounce-strategy'
const ID_VIEWPORT_STRATEGY = 'btn-viewport-strategy'
const ID_RENDER_COUNT = 'render-count'

describe(StreamDirective.name, () => {
  it('renders', async () => {
    const {render} = await setup();

    render();
  })
  it('should only re-render the EmbeddedViewRef and not the whole component', async () => {
    const {render} = await setup();
    render();

    cy.get(`#${INCREMENT_BUTTON_ID}`).click();

    cy.get(`#${ID_RENDER_COUNT}`).should('contain', '2');
  })
  describe('Config', () => {
    describe('lazyViewCreation', () => {
      it('should not render element when lazyViewCreation = true',  async () => {
        const {render} = await setup({
          streamConfig: {
            lazyViewCreation: true
          }
        });

        render();

        cy.get(`#${TEST_ELEMENT_ID}`).should('not.exist');

      });
      it('should not render element when lazyViewCreation = false',  async () => {
        const {render} = await setup({
          streamConfig: {
            lazyViewCreation: false
          }
        });

        render();

        cy.get(`#${TEST_ELEMENT_ID}`).should('exist');
      });
    })
  })


  describe('Render strategies', () => {
    describe('DefaultRenderStrategy', () => {
      it('should ', async () => {

      })
    })
    //describe('ThrottleRenderStrategy', () => {})
    //describe('DebounceRenderStrategy', () => {})
    //describe('ViewportRenderStrategy', () => {})
  })


});


async function setup(cfg?: {
  streamConfig?: StreamDirectiveConfig,
  mountConfig?: MountConfig<any>,
}) {
  await TestBed.configureTestingModule({
    imports: [StreamDirective],
    providers: [provideStreamDirectiveConfig(cfg?.streamConfig as StreamDirectiveConfig)],
    declarations: [TestHostComponent, DirtyCheckerComponent],
  })

  return {
    render: () => {
      cy.mount(TestHostComponent, cfg?.mountConfig)
    }
  }
}


@Component({
  selector: 'test-host',
  template: `
    <div>
      <div>
        <button [id]="INCREMENT_BTN" (click)="value$$.next(1)">update value</button>
        <dirty-checker></dirty-checker>
      </div>
      <div class="resizable">
        Push off viewport
      </div>
      Render Strategy
      <div *ngIf="renderStrategy$$ | async as renderStrategy">
        <div>Active: {{ renderStrategy.type }}</div>
        <div>Config: {{ getRenderStrategyConfig(renderStrategy) }}</div>
      </div>
      <div class="btns">
        <button [id]="ID_DEFAULT_STRATEGY" (click)="renderStrategy$$.next(DEFAULT_RENDER_STRATEGY)">DefaultStrategy</button>
        <button [id]="ID_THROTTLE_STRATEGY" (click)="renderStrategy$$.next(THROTTLE_RENDER_STRATEGY)">ThrottleStrategy</button>
        <button [id]="ID_DEBOUNCE_STRATEGY" (click)="renderStrategy$$.next(DEBOUNCE_RENDER_STRATEGY)">DebounceStrategy</button>
        <button [id]="ID_VIEWPORT_STRATEGY" (click)="renderStrategy$$.next(VIEW_PORT_STRATEGY)">ViewPortStrategy</button>
      </div>
    </div>
     <div>
       <div>
         <dirty-checker></dirty-checker>
         <span>L2 Component</span>
       </div>
       <p
         *stream="
        value$;
        let value;
        renderStrategy: renderStrategy$$;
        renderCallback: renderCallback$$;
        let count=renderCount
         "
         [id]="TEST_ELEMENT_ID"
         class="embedded">
          <span>Value: <span id="value">{{ value }}</span> </span>
         <span [id]="ID_RENDER_COUNT" class="count">{{ count }}</span>
       </p>
      </div>


  `,
  styles: [
    `
      :host {
        display: block;
        border: 1px dashed darkseagreen;
        width: 200px;
        padding: 16px;
      }
      .count {
        border: 1px solid green;
        border-radius: 100%;
        width: 40px;
        height: 40px;
        display: inline-flex;
        justify-content: center;
        align-items: center;
      }

      .btns {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: flex-start;
        gap: 8px;
        width: 100%;
        padding: 8px;
      }
      .resizable {
        width: 100%;
        height: 40px;
        resize: vertical;
        border: 1px solid black;
        overflow: auto;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestHostComponent{
  value$$ = new Subject<number>();
  value$ = this.value$$.pipe(scan((acc, value) => acc + 1, 0));

  DEFAULT_RENDER_STRATEGY: RenderStrategy = {
    type: 'default',
  }

  THROTTLE_RENDER_STRATEGY: ThrottleRenderStrategy = {
    type: 'throttle',
    throttleInMs: 500
  }

  DEBOUNCE_RENDER_STRATEGY: DebounceRenderStrategy = {
    type: 'debounce',
    debounceInMs: 500
  }

  VIEW_PORT_STRATEGY: ViewportRenderStrategy = {
    type: 'viewport',
    threshold: 0.5, rootMargin: '0px'
  }

  renderStrategy$$ = new BehaviorSubject<any>(this.DEFAULT_RENDER_STRATEGY)

  renderCallback$$ = new ReplaySubject<any>(1)
  TEST_ELEMENT_ID = TEST_ELEMENT_ID
  INCREMENT_BTN = INCREMENT_BUTTON_ID;
   ID_DEFAULT_STRATEGY = ID_DEFAULT_STRATEGY
   ID_THROTTLE_STRATEGY = ID_THROTTLE_STRATEGY
   ID_DEBOUNCE_STRATEGY = ID_DEBOUNCE_STRATEGY
   ID_VIEWPORT_STRATEGY = ID_VIEWPORT_STRATEGY
  ID_RENDER_COUNT = ID_RENDER_COUNT

  getRenderStrategyConfig(renderStrategy: RenderStrategy) {
    if (renderStrategy.type === 'throttle') {
      return `throttleInMs: ${(renderStrategy as any).throttleInMs}`
    } else if (renderStrategy.type === 'debounce') {
      return `debounceInMs: ${(renderStrategy as any).debounceInMs}`
    }

    return ''
  }
}

@Component({
  selector: 'dirty-checker',
  template: `{{label}} <span>{{dirtyCheck()}}</span>`,
  styles: [
    `
      :host {
        border: 1px solid green;
        border-radius: 100%;
        width: 40px;
        height: 40px;
        display: inline-flex;
        justify-content: center;
        align-items: center;
      }
    `,
  ],
})
export class DirtyCheckerComponent {
  @Input() label: string = '';
  private dirtyCheckCount = 0;

  dirtyCheck(): number {
    this.dirtyCheckCount++;
    return this.dirtyCheckCount;
  }
}
