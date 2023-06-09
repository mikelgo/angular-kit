import {RxHooks$} from './rx-hooks.directive';
import {Component, inject} from "@angular/core";
import {TestBed} from "@angular/core/testing";
import {subscribeSpyTo} from "@hirez_io/observer-spy";

describe('RxHooks$', () => {
  it('should create an instance', () => {
    const directive = new RxHooks$();
    expect(directive).toBeTruthy();
  });

  it('should emit onConstruct$', async () => {
    const {component} = await setup();

    const result = subscribeSpyTo(component.hooks$.onConstruct$);
    expect(result.getLastValue()).toEqual(void 0);
  });

  it('should emit onInit$', async () => {
    const {component} = await setup();

    const result = subscribeSpyTo(component.hooks$.onInit$);
    expect(result.getLastValue()).toEqual(void 0);
  });

  it('should emit doCheck$', async () => {
    const {component} = await setup();

    const result = subscribeSpyTo(component.hooks$.doCheck$);
    expect(result.getLastValue()).toEqual(void 0);
  });

  it('should emit afterContentInit$', async () => {
    const {component} = await setup();

    const result = subscribeSpyTo(component.hooks$.afterContentInit$);
    expect(result.getLastValue()).toEqual(void 0);
  });

  it('should emit afterContentChecked$', async () => {
    const {component} = await setup();

    const result = subscribeSpyTo(component.hooks$.afterContentChecked$);
    expect(result.getLastValue()).toEqual(void 0);
  });

  it('should emit afterViewInit$', async () => {
    const {component} = await setup();

    const result = subscribeSpyTo(component.hooks$.afterViewInit$);
    expect(result.getLastValue()).toEqual(void 0);
  })
  it('should emit afterViewChecked$', async () => {
    const {component} = await setup();

    const result = subscribeSpyTo(component.hooks$.afterViewChecked$);
    expect(result.getLastValue()).toEqual(void 0);
  })

  it('should emit onDestroy$', async () => {
    const {component} = await setup();

    const result = subscribeSpyTo(component.hooks$.onDestroy$);
    expect(result.getLastValue()).toEqual(void 0);
  })
});


async function setup(){
  @Component({
    selector: 'rx-hooks-test',
    template: '',
    hostDirectives: [RxHooks$],
    standalone: true,
  })
  class TestComponent {
     hooks$ = inject(RxHooks$);
  }

  await TestBed.configureTestingModule({
    imports: [TestComponent, RxHooks$],
  }).compileComponents();

  const fixture = TestBed.createComponent(TestComponent);
  const component = fixture.componentInstance;

  return {fixture, component};
}
