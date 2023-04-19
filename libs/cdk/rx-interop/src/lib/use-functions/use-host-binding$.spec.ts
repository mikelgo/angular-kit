import {useHostBinding} from "./use-host-binding";
import {Component, ElementRef, inject} from "@angular/core";
import {TestBed} from "@angular/core/testing";

describe('useHostBinding', () => {
  it('should create Testcomponent', async () => {
    const {component} = await setup(true);
    expect(component).toBeTruthy();
  });

  it('should add css class on init when enabledByDefault is true', async () => {
    const {cssClass, fixture} = await setup(true);

    expect(containsCssClass(fixture, cssClass)).toBe(true);
  });

  it('should NOT have css class on init when enabledByDefault is false', async () => {
    const { cssClass, fixture} = await setup(false);

    expect(containsCssClass(fixture, cssClass)).toBe(false);
  });

  it('should add and remove css class', async () => {
    const {component, cssClass, fixture} = await setup(false);

    expect(containsCssClass(fixture, cssClass)).toBe(false);

    component.hostBinding$.set(true);
    expect(containsCssClass(fixture, cssClass)).toBe(true);

    component.hostBinding$.set(false);
    expect(containsCssClass(fixture, cssClass)).toBe(false);
  });
})


async function setup(enabledByDefault: boolean) {
  const {TestComponent, cssClass} = createTestComponent(enabledByDefault);
  await TestBed.configureTestingModule({
    imports: [TestComponent]
  }).compileComponents();

  const fixture = TestBed.createComponent(TestComponent);
  const component = fixture.componentInstance;
  fixture.detectChanges();


  return {
    component,
    cssClass,
    fixture
  };
}

function containsCssClass(fixture, cssClass: string){
  return fixture.componentInstance.classList.contains(cssClass)
}



function createTestComponent(enabledByDefault: boolean){
  const cssClass = 'test-css-class';

  @Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'test',
    template: '',
    standalone: true,
    imports: [],
  })
  class TestComponent {
    hostBinding$ = useHostBinding(cssClass, enabledByDefault);
    classList = (inject(ElementRef).nativeElement as HTMLElement).classList;
  }

  return {TestComponent, cssClass}
}
