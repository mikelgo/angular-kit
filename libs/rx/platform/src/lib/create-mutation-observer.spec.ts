import {createMutationObserver} from './create-mutation-observer';
import {subscribeSpyTo} from '@hirez_io/observer-spy';
import {fakeAsync, tick} from '@angular/core/testing';
import {createElementRef, mockMutationObserver} from "../../../__test-utils/platform.testing";

describe('createMutationObserver', () => {
  describe('supported', () => {
    beforeEach(() => mockMutationObserver());
    it('should create', () => {
      const observer = createMutationObserver(createElementRef());
      expect(observer).toBeTruthy();
    });

    it('should emit on resize', fakeAsync(() => {
      const elementRef = createElementRef();
      const observer = createMutationObserver(elementRef);

      const result = subscribeSpyTo(observer);
      elementRef.nativeElement.dispatchEvent(new Event('mutate'));

      tick(1000);

      expect(result.getValues().length).toEqual(1);
    }));
  });
});
