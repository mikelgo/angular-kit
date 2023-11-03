import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterModule],
  selector: 'demo-pagination',
  template: `
    Hi
`,
  styles: [''],
})
export class DemoPaginationComponent {
  title = 'demo-rx-stateful';
}
