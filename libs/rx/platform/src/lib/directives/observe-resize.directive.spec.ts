import {RxObserveResizeDirective, RxObserveResizeDirectiveModule} from './rx-observe-resize.directive';
import {Component, ViewChild} from '@angular/core';
import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {mockResizeObserver} from '../../../../__test-utils/platform.testing';
import {subscribeSpyTo} from '@hirez_io/observer-spy';

describe('RxObserveResizeDirective', () => {
  it('should create an instance', async () => {
    const { testComponent } = await create();
    expect(testComponent).toBeTruthy();
  });

  it('should emit on resize', fakeAsync(async () => {
    const { testComponent, fixture } = await create();
    const result = subscribeSpyTo(testComponent.directive.resizeEvent);

    fixture.nativeElement.dispatchEvent(new Event('resize'));
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
          rxObserveResize
          (resizeEvent)="onResize()"
        >
          I'm being observed
        </h1>
      </section>
    `,
  })
  class TestComponent {
    @ViewChild(RxObserveResizeDirective, { static: true }) directive!: RxObserveResizeDirective;
    onResize = jest.fn();
    observe = true;
  }

  TestBed.configureTestingModule({
    imports: [RxObserveResizeDirectiveModule],
    declarations: [TestComponent],
  });
  mockResizeObserver();
  const fixture = TestBed.createComponent(TestComponent);
  const testComponent = fixture.componentInstance;
  fixture.detectChanges();

  return { fixture, testComponent };
}
