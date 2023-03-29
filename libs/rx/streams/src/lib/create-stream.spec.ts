import {createStream} from './create-stream';
import {subscribeSpyTo} from '@hirez_io/observer-spy';

describe('createStream', () => {
  it('should filter out undefined values', () => {
    const stream = createStream()

    const result = subscribeSpyTo(stream.$);

    stream.send(undefined);
    stream.send(10);

    expect(result.getValues()).toEqual([10]);
  });

  it('should filter out null values, when configured', () => {
    const stream = createStream({ filterNull: true })

    const result = subscribeSpyTo(stream.$);

    stream.send(undefined);
    stream.send(null);
    stream.send(10);

    expect(result.getValues()).toEqual([10]);
  });

  it('should emit only distinct values', () => {
    const stream = createStream()

    const result = subscribeSpyTo(stream.$);

    stream.send(10);
    stream.send(10);

    stream.send(5);

    stream.send(10);
    stream.send(10);

    expect(result.getValues()).toEqual([10, 5, 10]);
  });

  it('should emit initial value', () => {
    const stream = createStream(10);

    const result = subscribeSpyTo(stream.$);

    expect(result.getValues()).toEqual([10]);
  })

  it('should allow initial value and config', () => {
    const stream = createStream<number | null>(10, { filterNull: true });

    const result = subscribeSpyTo(stream.$);

    stream.send(null);

    expect(result.getValues()).toEqual([10]);
  })
});


