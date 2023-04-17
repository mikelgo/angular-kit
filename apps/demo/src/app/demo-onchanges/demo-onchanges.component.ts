import {Component, Input, OnChanges} from '@angular/core';
import {CommonModule} from '@angular/common';
import {injectOnChanges$, provideOnChanges$} from "../../../../../libs/cdk/rx-interop/src/lib/on-changes-state";
import {TypedSimpleChanges} from "../../../../../libs/cdk/rx-interop/src/lib/effect-on-changes$";
import {map} from "rxjs";


interface Inputs {
  name: string;
  value: number;
}

@Component({
  selector: 'demo-onchanges',
  standalone: true,
  imports: [CommonModule],
  template: `
    Input values:
    <br>
    Name: {{ name }} Value: {{ value }}
    <br>
    Changes:
    {{ changes$ | async | json }}
    <br>
    ChangesState:
    {{ changesState$ | async | json }}
    <br>
    NameChange:
    {{ nameChange$ | async }}
    <br>
    ValueChange:
    {{ valueChange$ | async }}
  `,
  styles: [`
    :host{
      display: block;
      padding: 1rem;
      background: #f5f5f5;
      border: 1px solid #ccc;
    }
  `],
  providers: [provideOnChanges$<Inputs>()],
})
export class DemoOnchangesComponent implements OnChanges{
  @Input() value: number = 0;
  @Input() name: string = '';

  onChangesState = injectOnChanges$<Inputs>();

  changes$ = this.onChangesState.changes$;
  changesState$ = this.onChangesState.changesState$;

  nameChange$ = this.onChangesState.changesState$.pipe(map(x => x.name));
  valueChange$ = this.onChangesState.changesState$.pipe(map(x => x.value));

  ngOnChanges(changes: TypedSimpleChanges<Inputs>) {
    this.onChangesState.connect$(changes)
  }

  constructor() {

  }
}
