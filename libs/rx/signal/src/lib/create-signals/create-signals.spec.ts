import {createSignals} from "./create-signals";

describe('createSignals', () => {

  it('should create the signals', () => {
    const signals = createSignals<TestSignals>();
    expect( typeof signals.one).toBeDefined();
    expect( typeof signals.two).toBeDefined();
    expect( typeof signals.three).toBeDefined();
  })


  it('should create the signal observables', () => {
    const signals = createSignals<TestSignals>();
    expect( typeof signals.one$).toBeDefined();
    expect( typeof signals.two$).toBeDefined();
    expect( typeof signals.three$).toBeDefined();
  })

  it('the observables should emit the signal values', (done) => {
    const signals = createSignals<TestSignals>();
    signals.one$.subscribe( value => {
      expect(value).toBe('one')
      done();
    })
    signals.one('one')
  })
})


interface TestSignals{
  one: string;
  two: number;
  three: boolean;
}
