import {SimpleChange} from "@angular/core";
import {TypedSimpleChanges} from "../effect-on-changes$";

/**
 * @internal
 * @param changes
 */
export function mapChanges<I extends Record<string, any>>(changes: Partial<TypedSimpleChanges<I>>): Partial<I> {
  const t = {} as Partial<I>;
  Object.entries(changes).forEach((entry) => {
    const key = entry[0];

    const value: SimpleChange = entry[1] as SimpleChange;

    // @ts-ignore
    t[key] = value.currentValue;
  });

  return t;
}
