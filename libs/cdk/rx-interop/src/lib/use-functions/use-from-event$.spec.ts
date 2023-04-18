import {subscribeSpyTo} from "@hirez_io/observer-spy";
import {TestBed} from "@angular/core/testing";
import {Component, ElementRef, inject} from "@angular/core";
import {useFromEvent$} from "./use-from-event$";

describe('useFromEvent$', () => {
  it('should create', async () => {
    const {useFromEvent$} = await setup();
    expect(useFromEvent$).toBeTruthy();
  });

  it('should emit when host is clicked', async () => {
    const {useFromEvent$, fixture} = await setup();
    const result = subscribeSpyTo(useFromEvent$);
    const event = new MouseEvent('click');

    fixture.debugElement.triggerEventHandler('click', event);
    (fixture.nativeElement as HTMLElement).click();

    expect(result.getLastValue()).toEqual(event);
  });
});



async function setup() {

  await TestBed.configureTestingModule({
    imports: [TestComponent],
  }).compileComponents();

  const fixture = TestBed.createComponent(TestComponent);
  const component = fixture.componentInstance;
  fixture.detectChanges();

  const useFromEvent$ = component.hostClick$;

  return {component, useFromEvent$, fixture};
}

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'test',
  template: '',
  standalone: true,
  imports: []
})
class TestComponent {
  element = inject(ElementRef)
  hostClick$ = useFromEvent$(this.element,'click');
}
