import {createEffect} from "./create-effect";
import {of, Subject} from "rxjs";
import {subscribeSpyTo} from "@hirez_io/observer-spy";

describe('createEffect', () => {
  it('should create', () => {
    const effect = createEffect(() => of(42), new Subject());
    expect(effect).toBeTruthy();
  });

  it('should emit when trigger is emitted', () => {
    const source$ = of(10);
    const trigger$$ = new Subject();

    const effect = createEffect(() => source$, trigger$$);

    const result = subscribeSpyTo(effect)

    trigger$$.next(void 0);
    trigger$$.next(void 0);



    expect(result.getValues()).toEqual([
      10,
      10
    ]);
  });
})
