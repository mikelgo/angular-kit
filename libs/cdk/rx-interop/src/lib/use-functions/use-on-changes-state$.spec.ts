import {Component, Input, OnChanges, ViewChild} from "@angular/core";
import {TypedSimpleChanges} from "../on-changes/effect-on-changes$";
import {TestBed, waitForAsync} from "@angular/core/testing";
import {subscribeSpyTo} from "@hirez_io/observer-spy";
import {BehaviorSubject} from "rxjs";
import {AsyncPipe} from "@angular/common";
import {useOnChangesState$} from "./use-on-changes-state$";

describe('useOnChangesState$', () => {
  it('should create', async () => {
    const {useOnChangesState$} = await setup();
    expect(useOnChangesState$).toBeTruthy();
  });
  it('should emit distinct changes', waitForAsync(async () => {
    const {useOnChangesState$, component, fixture} = await setup();

    const result = subscribeSpyTo(useOnChangesState$);

    component.name$.next('test2');
    fixture.detectChanges();

    expect(result.getValues()?.length).toEqual(2)
    expect(result.getValues()).toEqual([
      {id: 1, name: 'test'},
      {id: 1, name: 'test2'}
    ]);

  }));
})

async function setup() {

  await TestBed.configureTestingModule({
    imports: [TestHostComponent, TestComponent],
  }).compileComponents();

  const fixture = TestBed.createComponent(TestHostComponent);
  const component = fixture.componentInstance;
  fixture.detectChanges();

  const useOnChangesState$ = component.component.useOnChangesState$;

  return {component, useOnChangesState$, fixture};
}

interface TestInputs {
  id: number;
  name: string;
}
@Component({
  selector: 'test',
  template: '',
  standalone: true,
  imports: []
})
class TestComponent implements OnChanges{
  @Input() id!: number;
  @Input() name!: string;

  useOnChangesState$ = useOnChangesState$(this);

  ngOnChanges(changes: TypedSimpleChanges<TestInputs>) {
    // no implementation needed
  }
}
@Component({
  selector: 'test-host',
  template: '<test [id]="(id$ | async)!" [name]="(name$ | async)!"></test>',
  standalone: true,
  imports: [
    TestComponent,
    AsyncPipe
  ]
})
class TestHostComponent  {
  @ViewChild(TestComponent, {static: true})
  component!: TestComponent;
  id$ = new BehaviorSubject<number>(1)
  name$ = new BehaviorSubject<string>('test')

}

