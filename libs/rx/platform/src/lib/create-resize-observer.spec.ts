import {createResizeObserver} from './create-resize-observer';
import {fakeAsync, tick} from '@angular/core/testing';
import {subscribeSpyTo} from '@hirez_io/observer-spy';
import {createElementRef, mockResizeObserver} from '@test-helpers';

describe('createResizeObserver', () => {
  describe('supported', () => {
    beforeEach(() => mockResizeObserver());
    it('should create', () => {
      const observer = createResizeObserver(createElementRef());
      expect(observer).toBeTruthy();
    });

    it('should emit on resize', fakeAsync(() => {
      const elementRef = createElementRef();
      const observer = createResizeObserver(elementRef);

      const result = subscribeSpyTo(observer);
      elementRef.nativeElement.dispatchEvent(new Event('resize'));

      tick(1000);

      expect(result.getValues().length).toEqual(1);
    }));
  });
});
