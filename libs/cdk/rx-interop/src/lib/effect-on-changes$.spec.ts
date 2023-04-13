import {effectOnChanges$, TypedSimpleChanges} from "./effect-on-changes$";
import {Subject} from "rxjs";
import {subscribeSpyTo} from "@hirez_io/observer-spy";
import {mapChanges} from "./util/map-changes";

describe(effectOnChanges$.name, () => {

  it('should execute effect on complete changes object', () => {
    const firstChange: TypedSimpleChanges<Inputs> = createFirstChange();
    const secondChange: TypedSimpleChanges<Inputs> = createSecondChange(firstChange);
    const effect$ = new Subject<Partial<Inputs>>();

    const result = subscribeSpyTo(effect$);

    effectOnChanges$(firstChange, (changes) => effect$.next(changes));
    effectOnChanges$(secondChange, (changes) => effect$.next(changes));

    expect(result.getValues()).toEqual([mapChanges(firstChange), mapChanges(secondChange)])

  });

  it('should execute effect on picked property of object', () => {
    const firstChange: TypedSimpleChanges<Inputs> = createFirstChange();
    const secondChange: TypedSimpleChanges<Inputs> = createSecondChange(firstChange);
    const effect$ = new Subject<Partial<Inputs>>();

    const result = subscribeSpyTo(effect$);

    effectOnChanges$(firstChange, 'id',(changes) => effect$.next(changes));
    effectOnChanges$(secondChange, 'id',(changes) => effect$.next(changes));

    expect(result.getValues()).toEqual([firstChange['id'].currentValue, secondChange['id'].currentValue])

  });
});

interface Inputs{
  id: number;
  name: string;
}

function createFirstChange(): TypedSimpleChanges<Inputs>{
  return {
    id: {
      firstChange: true,
      previousValue: undefined,
      currentValue: 1,
      isFirstChange(): boolean {
        return true;
      }
    },
    name: {
      firstChange: true,
      previousValue: undefined,
      currentValue: 'test',
      isFirstChange(): boolean {
        return true;
      }
    }
  }
}
function createSecondChange(firstChange: TypedSimpleChanges<Inputs>): TypedSimpleChanges<Inputs>{
  return {
    id: {
      firstChange: false,
      previousValue: firstChange['id'].currentValue,
      currentValue: 10,
      isFirstChange(): boolean {
        return false;
      }
    }
  }
}
