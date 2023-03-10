import {TestBed} from "@angular/core/testing";
import {mockMutationObserver} from "../../../../__test-utils/platform.testing"
import {SUPPORTS_MUTATION_OBSERVER} from "../supports-mutation-observer.token";

describe('SUPPORTS_MUTATION_OBSERVER', () => {
  it('should be true when the API is supported', () => {
    TestBed.configureTestingModule({
      providers: []
    });

    mockMutationObserver();

    const token = TestBed.inject(SUPPORTS_MUTATION_OBSERVER);
    expect(token).toBeTruthy();
  });
  it('should be false when the API is not supported', () => {
    TestBed.configureTestingModule({
      providers: []
    });

    const token = TestBed.inject(SUPPORTS_MUTATION_OBSERVER);
    expect(token).toBeTruthy();
  });
});
