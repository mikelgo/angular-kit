import {TestBed} from "@angular/core/testing";
import {mockResizeObserver} from "@test-helpers"
import {SUPPORTS_RESIZE_OBSERVER} from "../supports-resize-observer.token";

describe('SUPPORTS_RESIZE_OBSERVER', () => {
  it('should be true when the API is supported', () => {
    TestBed.configureTestingModule({
      providers: []
    });

    mockResizeObserver();

    const token = TestBed.inject(SUPPORTS_RESIZE_OBSERVER);
    expect(token).toBeTruthy();
  });
  it('should be false when the API is not supported', () => {
    TestBed.configureTestingModule({
      providers: []
    });

    const token = TestBed.inject(SUPPORTS_RESIZE_OBSERVER);
    expect(token).toBeTruthy();
  });
});
