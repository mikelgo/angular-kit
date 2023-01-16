import {createSignal} from './create-signal';
import {subscribeSpyTo} from '@hirez_io/observer-spy';

describe('createSignal', () => {
  it('should filter out undefined values', () => {
    const signal = createSignal()

    const result = subscribeSpyTo(signal.$);

    signal.send(undefined);
    signal.send(10);

    expect(result.getValues()).toEqual([10]);
  });

  it('should filter out null values, when configured', () => {
    const signal = createSignal({ filterNull: true })

    const result = subscribeSpyTo(signal.$);

    signal.send(undefined);
    signal.send(null);
    signal.send(10);

    expect(result.getValues()).toEqual([10]);
  });

  it('should emit only distinct values', () => {
    const signal = createSignal()

    const result = subscribeSpyTo(signal.$);

    signal.send(10);
    signal.send(10);

    signal.send(5);

    signal.send(10);
    signal.send(10);

    expect(result.getValues()).toEqual([10, 5, 10]);
  });

  it('should emit initial value', () => {
    const signal = createSignal(10);

    const result = subscribeSpyTo(signal.$);

    expect(result.getValues()).toEqual([10]);
  })

  it('should allow initial value and config', () => {
    const signal = createSignal<number | null>(10, { filterNull: true });

    const result = subscribeSpyTo(signal.$);

    signal.send(null);

    expect(result.getValues()).toEqual([10]);
  })
});


