import {TestBed} from "@angular/core/testing";
import {SUPPORTS_INTERSECTION_OBSERVER} from "../supports-intersection-observer.token";
import {mockIntersectionObserver} from "@test-helpers"

describe('SUPPORTS_INTERSECTION_OBSERVER', () => {
  it('should be true when the API is supported', () => {
    TestBed.configureTestingModule({
      providers: []
    });

    mockIntersectionObserver();

    const token = TestBed.inject(SUPPORTS_INTERSECTION_OBSERVER);
    expect(token).toBeTruthy();
  });
  it('should be false when the API is not supported', () => {
    TestBed.configureTestingModule({
      providers: []
    });

    const token = TestBed.inject(SUPPORTS_INTERSECTION_OBSERVER);
    expect(token).toBeTruthy();
  });
});
