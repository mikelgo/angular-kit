import { ObserveResizeDirective, ObserveResizeDirectiveModule } from './observe-resize.directive';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { mockResizeObserver } from '../../../../../testing/rx/platform.testing';

describe('ObserveResizeDirective', () => {
  it('should create an instance', async () => {
    const { testComponent } = await create();
    expect(testComponent).toBeTruthy();
  });
});

async function create() {
  @Component({
    template: `
      <section style="position: relative; height: 200px; overflow: auto;">
        <h1
          id="resize_elem"
          style="position: absolute; top: 200px; height: 200px;"
          observeResize
          (resizeEvent)="onResize()"
        >
          I'm being observed
        </h1>
      </section>
    `,
  })
  class TestComponent {
    onResize = jest.fn();
    observe = true;
  }

  let fixture: ComponentFixture<TestComponent>;
  let testComponent: TestComponent;

  TestBed.configureTestingModule({
    imports: [ObserveResizeDirectiveModule],
    declarations: [TestComponent],
  });
  mockResizeObserver();
  fixture = TestBed.createComponent(TestComponent);
  testComponent = fixture.componentInstance;
  fixture.detectChanges();

  return { fixture, testComponent };
}
