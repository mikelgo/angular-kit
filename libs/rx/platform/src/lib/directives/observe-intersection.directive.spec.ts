import {RxObserveIntersectionDirective} from './observe-intersection.directive';
import {Component, ViewChild} from '@angular/core';
import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {subscribeSpyTo} from '@hirez_io/observer-spy';
import {mockIntersectionObserver} from '../../../../__test-utils/platform.testing';

describe('ObserveIntersectionDirective', () => {
  it('should create an instance', async () => {
    const { testComponent } = await create();
    expect(testComponent).toBeTruthy();
  });

  it('should emit on intersection', fakeAsync(async () => {
    const { testComponent, fixture } = await create();
    const result = subscribeSpyTo(testComponent.directive.intersect);

    fixture.nativeElement.dispatchEvent(new Event('intersect'));
    tick(1000);
    expect(result.getValues().length).toEqual(1);
  }));
});

async function create() {
  @Component({
    template: `
      <section style="position: relative; height: 200px; overflow: auto;">
        <h1
          id="resize_elem"
          style="position: absolute; top: 200px; height: 200px;"
          rxObserveIntersection
          (intersect)="onChange()"
        >
          I'm being observed
        </h1>
      </section>
    `,
  })
  class TestComponent {
    @ViewChild(RxObserveIntersectionDirective, { static: true }) directive!: RxObserveIntersectionDirective;
    onChange = jest.fn();
    observe = true;
  }

  TestBed.configureTestingModule({
    imports: [RxObserveIntersectionDirective],
    declarations: [TestComponent],
  });
  mockIntersectionObserver();
  const fixture = TestBed.createComponent(TestComponent);
  const testComponent = fixture.componentInstance;
  fixture.detectChanges();

  return { fixture, testComponent };
}
