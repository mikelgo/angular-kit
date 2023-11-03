import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterModule],
  selector: 'demo-basic-usage',
  template: `
    Hi
`,
  styles: [''],
})
export class DemoBasicUsageComponent {
  title = 'demo-rx-stateful';
}
