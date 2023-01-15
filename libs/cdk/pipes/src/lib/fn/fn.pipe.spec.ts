import {RunFnExpression, RunFnPipe} from './fn.pipe';

describe('FnPipe', () => {
  let pipe: RunFnPipe;
  beforeEach(() => pipe = create());
  it('create an instance', () => {

    expect(pipe).toBeTruthy();
  });

  it('should return the result of the passed in function', () => {
    const testFn = (a: number, b: number) => a + b;
    expect(pipe.transform(testFn, 1, 2)).toEqual(3);
  });
  it('should throw error when no valid function is passed',  () => {
    expect(() => pipe.transform(null as any as  RunFnExpression<any>)).toThrowError();
  });

});


function create() {
  return new RunFnPipe()
}
