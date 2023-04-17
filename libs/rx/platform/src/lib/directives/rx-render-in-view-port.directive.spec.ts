import {fakeAsync, TestBed, tick} from "@angular/core/testing";
import {Component, ViewChild} from "@angular/core";
import {RxRenderInViewportDirective} from "./rx-render-in-view-port.directive";
import {By} from "@angular/platform-browser";
import {mockIntersectionObserver} from '../../../../__test-utils/platform.testing';

describe('RxRenderInViewportDirective', () => {
  it('should create an instance', async () => {
    const { testComponent } = await create();
    expect(testComponent).toBeTruthy();
  });

  it('should be rendered on intersection', fakeAsync(async () => {
    const {  fixture } = await create();

    fixture.nativeElement.dispatchEvent(new Event('intersect'));
    tick(1000);

    const element = fixture.debugElement.query(By.css('h1'));
    expect(element).toBeTruthy();


  }));
});

async function create() {
  @Component({
    template: `
      <section style="position: relative; height: 200px; overflow: auto;">
        <h1
          id="resize_elem"
          style="position: absolute; top: 200px; height: 200px;"
          *rxRenderInViewport="'0px'"
        >
          I'm being observed
        </h1>
      </section>
    `,
  })
  class TestComponent {
    @ViewChild(RxRenderInViewportDirective, { static: true }) directive!: RxRenderInViewportDirective;
    observe = true;
  }

  TestBed.configureTestingModule({
    imports: [RxRenderInViewportDirective],
    declarations: [TestComponent],
  });
  mockIntersectionObserver();
  const fixture = TestBed.createComponent(TestComponent);
  const testComponent = fixture.componentInstance;
  fixture.detectChanges();

  return { fixture, testComponent };
}
