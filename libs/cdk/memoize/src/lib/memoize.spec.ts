import {Memoize, memoize, MemoizedProjection} from './memoize';
import spyOn = jest.spyOn;

class Test {
  calc(a: number, b: number): number {
    return memoize((a, b) => a + b).memoized(a, b);
  }

  @Memoize()
  calculate(a: number, b: number): number {
    return a + b;
  }
}
describe('memoize function', () => {
  let memoizer: MemoizedProjection<number>;
  let projectionFnSpy: jest.Mock;

  beforeEach(() => {
    function isResultEqual(a: any, b: any) {
      if (a instanceof Array) {
        return a.length === b.length && a.every((fromA) => b.includes(fromA));
      }
      // Default comparison
      return a === b;
    }
    projectionFnSpy = jest
      .fn()
      .mockReturnValue((a: number, b: number) => a + b);

    memoizer = memoize(projectionFnSpy, isResultEqual);
  });
  it('mem-decorator should work', () => {
    const c = new Test();
    spyOn(c, 'calculate');

    c.calculate(1, 1);
    c.calculate(1, 1);
    c.calculate(1, 1);

    expect(c.calculate(1, 1)).toEqual(2);
  });
  it('should memoize class function ', () => {
    const c = new Test();
    c.calc(10, 10);
    c.calc(10, 10);
  });

  it('should calculate only twice', () => {
    memoizer.memoized(1, 1);
    memoizer.memoized(1, 1);
    memoizer.memoized(1, 22);
    memoizer.memoized(1, 22);
    memoizer.memoized(1, 22);
    memoizer.memoized(1, 22);

    expect(projectionFnSpy).toHaveBeenCalledTimes(2);
  });

  it('should recalculate once reset was triggered', () => {
    memoizer.memoized(1, 1);
    memoizer.reset();
    memoizer.memoized(1, 1);
    memoizer.reset();
    memoizer.memoized(1, 1);

    expect(projectionFnSpy).toHaveBeenCalledTimes(3);
  });

  it('should not calculate when result was set', () => {
    memoizer.setResult(2);
    memoizer.memoized(1, 1);

    expect(projectionFnSpy).toHaveBeenCalledTimes(0);
  });
});
