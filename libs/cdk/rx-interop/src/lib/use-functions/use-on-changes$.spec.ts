import {Component, Input, OnChanges, ViewChild} from "@angular/core";
import {TypedSimpleChanges} from "../on-changes/effect-on-changes$";
import {TestBed, waitForAsync} from "@angular/core/testing";
import {useOnChanges$} from "./use-on-changes$";
import {subscribeSpyTo} from "@hirez_io/observer-spy";
import {BehaviorSubject} from "rxjs";
import {AsyncPipe} from "@angular/common";

describe('useOnChanges$', () => {
  it('should create', async () => {
    const {useOnChanges$} = await setup();
    expect(useOnChanges$).toBeTruthy();
  });
  it('should emit distinct changes', waitForAsync(async () => {
    const {useOnChanges$, component, fixture} = await setup();

    const result = subscribeSpyTo(useOnChanges$);

    component.name$.next('test2');


    fixture.detectChanges();

    expect(result.getValues()?.length).toEqual(2)
   expect(result.getValues()).toEqual([
      {id: 1, name: 'test'},
      {name: 'test2'}
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

  const useOnChanges$ = component.component.useOnChanges$;

  return {component, useOnChanges$, fixture};
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

  useOnChanges$ = useOnChanges$(this);

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

