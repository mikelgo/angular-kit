import {createElementRef, mockIntersectionObserver} from '@angular-kit/test-helpers';
import {createIntersectionObserver} from './create-intersection-observer';
import {subscribeSpyTo} from '@hirez_io/observer-spy';
import {fakeAsync, tick} from '@angular/core/testing';

describe('createIntersectionObserver', () => {
  describe('supported', () => {
    beforeEach(() => mockIntersectionObserver());
    it('should create', () => {
      const observer = createIntersectionObserver(createElementRef());
      expect(observer).toBeTruthy();
    });

    it('should emit on intersect', fakeAsync(() => {
      const elementRef = createElementRef();
      const observer = createIntersectionObserver(elementRef);

      const result = subscribeSpyTo(observer);
      elementRef.nativeElement.dispatchEvent(new Event('intersect'));

      tick(1000);

      expect(result.getValues().length).toEqual(1);
    }));
  });
});
