import {LazyPipe} from './lazy.pipe';

describe('LazyPipe', () => {
  it('create an instance', () => {
    const pipe = new LazyPipe();
    expect(pipe).toBeTruthy();
  });
});
