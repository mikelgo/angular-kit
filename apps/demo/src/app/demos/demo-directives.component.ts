import {ChangeDetectionStrategy, Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RxObserveResizeDirective, RxRenderInViewportDirective} from "@angular-kit/rx/platform";
import {
  RxObserveVisibilityDirective
} from "../../../../../libs/rx/platform/src/lib/directives/rx-observe-visibility.directive";

@Component({
  selector: 'angular-kit-demo-directives',
  standalone: true,
  imports: [CommonModule, RxObserveResizeDirective, RxObserveVisibilityDirective, RxRenderInViewportDirective],
  template: `
    <h1>Watch the browser console</h1>
    <div class="space" rxObserveResize ></div>

    <div class="resizable" *rxRenderInViewport="'0px'"></div>

    <div class="resizable" rxObserveVisibility  (intersectStatusChange)="onResize($event)"></div>

  `,
  styles: [`
    :host {
      display: block;
    }
    .resizable {
      width: 600px;
      height: 400px;
      border: 1px solid black;
        background-color: #eee;
      resize: both;
      overflow: auto;
    }

    .space {
      height: 1000px;
    }

  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoDirectivesComponent {


  onResize($event: any) {
    //console.log($event);
  }
}
