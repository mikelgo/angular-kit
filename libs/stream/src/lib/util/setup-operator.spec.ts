import {setupOperator$} from "./setup-operator";
import {debounceTime, Observable, of, pipe, throttleTime} from "rxjs";
import {RenderStrategies} from "../types/render-strategies";
import {subscribeSpyTo} from "@hirez_io/observer-spy";

describe(`${setupOperator$.name}`, () => {
  it('should emit throttleTime-operator for ThrottleStrategy', () => {
    const renderStrategy$: Observable<RenderStrategies> = of({type: 'throttle', throttleInMs: 1000});

    const operator$ = setupOperator$(renderStrategy$);

    const result = subscribeSpyTo(operator$);

    expect(result.getLastValue()).toEqual(throttleTime(1000));
  })
  it('should emit debounce-operator for DebounceStrategy', () => {
    const renderStrategy$: Observable<RenderStrategies> = of({type: 'debounce', debounceInMs: 1000});

    const operator$ = setupOperator$(renderStrategy$);

    const result = subscribeSpyTo(operator$);

    expect(result.getLastValue()).toEqual(debounceTime(1000));
  })

  it('should emit empty-operator for DefaultStrategy', () => {
    const renderStrategy$: Observable<RenderStrategies> = of({type: 'default'});

    const operator$ = setupOperator$(renderStrategy$);

    const result = subscribeSpyTo(operator$);

    expect(result.getLastValue()).toEqual(pipe());
  });

  it('should emit empty-operator when no strategy matches', () => {
    const renderStrategy$: Observable<RenderStrategies> = of(null as unknown as RenderStrategies);

    const operator$ = setupOperator$(renderStrategy$);

    const result = subscribeSpyTo(operator$);

    expect(result.getLastValue()).toEqual(pipe());
  });
});
