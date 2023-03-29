import {createStreams} from "./create-streams";

describe('createSignals', () => {

  it('should create the signals', () => {
    const streams = createStreams<TestSignals>();
    expect( typeof streams.one).toBeDefined();
    expect( typeof streams.two).toBeDefined();
    expect( typeof streams.three).toBeDefined();
  })


  it('should create the signal observables', () => {
    const streams = createStreams<TestSignals>();
    expect( typeof streams.one$).toBeDefined();
    expect( typeof streams.two$).toBeDefined();
    expect( typeof streams.three$).toBeDefined();
  })

  it('the observables should emit the signal values', (done) => {
    const streams = createStreams<TestSignals>();
    streams.one$.subscribe( value => {
      expect(value).toBe('one')
      done();
    })
    streams.one('one')
  })
})


interface TestSignals{
  one: string;
  two: number;
  three: boolean;
}
