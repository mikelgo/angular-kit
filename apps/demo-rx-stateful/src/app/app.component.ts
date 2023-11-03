import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import {NavigationComponent} from "./navigation.component";

@Component({
  standalone: true,
  imports: [RouterModule, NavigationComponent],
  selector: 'demo-root',
  template: `
    <h1>RxStateful Demo</h1>
    <p>
      Select one of the demos from the tabs below
    </p>
    <navigation/>
  `,
  styles: [`
    :host {
      display:block;
      padding: 32px 64px 32px 64px;
    }
  `],
})
export class AppComponent {
  title = 'demo-rx-stateful';
}
