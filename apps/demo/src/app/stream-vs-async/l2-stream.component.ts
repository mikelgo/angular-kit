import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {BehaviorSubject, Observable, ReplaySubject} from 'rxjs';
import {
    DebounceRenderStrategy,
    RenderStrategy,
    StreamDirective,
    ThrottleRenderStrategy,
    ViewportRenderStrategy
} from "@angular-kit/stream";
import {NgxDirtyCheckerModule} from '@code-workers.io/ngx-dirty-checker';
import {AsyncPipe, NgIf} from '@angular/common';


@Component({
    selector: 'angular-kit-l2-stream',
    template: `
    <div>
      Render Strategy
      <div *ngIf="renderStrategy$$ | async as renderStrategy">
        <div>Active: {{ renderStrategy.type }}</div>
        <div>Config: {{ getRenderStrategyConfig(renderStrategy) }}</div>
      </div>
      <div class="btns">
        <button (click)="renderStrategy$$.next(DEFAULT_RENDER_STRATEGY)">DefaultStrategy</button>
        <button (click)="renderStrategy$$.next(THROTTLE_RENDER_STRATEGY)">ThrottleStrategy</button>
        <button (click)="renderStrategy$$.next(DEBOUNCE_RENDER_STRATEGY)">DebounceStrategy</button>
        <button (click)="renderStrategy$$.next(VIEW_PORT_STRATEGY)">ViewPortStrategy</button>
      </div>
    </div>
    <div>
      <ngx-dirty-checker></ngx-dirty-checker>
      <span>L2 Component</span>
    </div>
    <p
        *stream="
        value;
        let v;
        renderStrategy: renderStrategy$$;
        renderCallback: renderCallback$$;
        let count=renderCount
        lazyViewCreation: true
"
        class="embedded">
      Value from L2: {{ v }}
      <span class="count">{{ count }}</span>
    </p>
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
    `,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        NgIf,
        NgxDirtyCheckerModule,
        StreamDirective,
        AsyncPipe,
    ],
})
export class L2StreamComponent {
  @Input() value!: Observable<any>;

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

  getRenderStrategyConfig(renderStrategy: RenderStrategy) {
    if (renderStrategy.type === 'throttle') {
      return `throttleInMs: ${(renderStrategy as any).throttleInMs}`
    } else if (renderStrategy.type === 'debounce') {
      return `debounceInMs: ${(renderStrategy as any).debounceInMs}`
    }

    return ''
  }
}
