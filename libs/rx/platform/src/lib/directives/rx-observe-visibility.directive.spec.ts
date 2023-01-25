import {RxObserveVisibilityDirective, RxObserveVisibilityDirectiveModule} from './rx-observe-visibility.directive';
import {Component, ViewChild} from '@angular/core';
import {mockIntersectionObserver} from '@test-helpers';
import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {subscribeSpyTo} from '@hirez_io/observer-spy';

describe('RxObserveVisibilityDirective', () => {
  it('should create an instance', async () => {
    const { testComponent } = await create();
    expect(testComponent).toBeTruthy();
  });

  it('should emit on intersection', fakeAsync(async () => {
    const { testComponent, fixture } = await create();
    const result = subscribeSpyTo(testComponent.directive.intersectStatusChange);

    fixture.nativeElement.dispatchEvent(new Event('intersect'));
    tick(1000);
    expect(result.getValues()).toEqual(['Visible']);
  }));
});

async function create() {
  @Component({
    template: `
      <section style="position: relative; height: 200px; overflow: auto;">
        <h1
          id="resize_elem"
          style="position: absolute; top: 200px; height: 200px;"
          rxObserveVisibility
          (intersectStatusChange)="onChange()"
        >
          I'm being observed
        </h1>
      </section>
    `,
  })
  class TestComponent {
    @ViewChild(RxObserveVisibilityDirective, { static: true }) directive!: RxObserveVisibilityDirective;
    onChange = jest.fn();
    observe = true;
  }

  TestBed.configureTestingModule({
    imports: [RxObserveVisibilityDirectiveModule],
    declarations: [TestComponent],
  });
  mockIntersectionObserver();
  const fixture = TestBed.createComponent(TestComponent);
  const testComponent = fixture.componentInstance;
  fixture.detectChanges();

  return { fixture, testComponent };
}
