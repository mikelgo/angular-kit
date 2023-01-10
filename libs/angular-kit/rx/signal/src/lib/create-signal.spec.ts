import { createSignal, Signal, SignalConfig } from './create-signal';
import { subscribeSpyTo } from '@hirez_io/observer-spy';
import { tap } from 'rxjs';

describe('createSignal', () => {
  it('should filter out undefined values', () => {
    const signal = createTestSignal();

    const result = subscribeSpyTo(signal.$);

    signal.next(undefined);
    signal.next(10);

    expect(result.getValues()).toEqual([10]);
  });

  it('should filter out null values, when configured', () => {
    const signal = createTestSignal({ filterNull: true });

    const result = subscribeSpyTo(signal.$);

    signal.next(undefined);
    signal.next(null);
    signal.next(10);

    expect(result.getValues()).toEqual([10]);
  });

  it('should emit only distinct values', () => {
    const signal = createTestSignal();

    const result = subscribeSpyTo(signal.$);

    signal.next(10);
    signal.next(10);

    signal.next(5);

    signal.next(10);
    signal.next(10);

    expect(result.getValues()).toEqual([10, 5, 10]);
  });
});

function createTestSignal(cfg?: SignalConfig<number | undefined | null>): Signal<number | undefined | null> {
  return createSignal<number | undefined | null>(cfg);
}
