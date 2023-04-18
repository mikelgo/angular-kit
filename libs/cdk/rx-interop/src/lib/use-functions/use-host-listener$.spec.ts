import {useHostListener$} from "./use-host-listener$";
import {Component} from "@angular/core";
import {TestBed} from "@angular/core/testing";
import {subscribeSpyTo} from "@hirez_io/observer-spy";

describe('useHostListener$', () => {
  it('should create', async () => {
    const {useHostListener$} = await setup();
    expect(useHostListener$).toBeTruthy();
  });

  it('should emit when host is clicked', async () => {
    const {useHostListener$, fixture} = await setup();
    const result = subscribeSpyTo(useHostListener$);
    const event = new MouseEvent('click');
    //document.dispatchEvent(event);
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

  const useHostListener$ = component.hostClick$;

  return {component, useHostListener$, fixture};
}

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'test',
  template: '',
  standalone: true,
  imports: []
})
class TestComponent {
  hostClick$ = useHostListener$('click');
}
