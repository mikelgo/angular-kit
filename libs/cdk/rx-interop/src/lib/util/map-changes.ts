import {SimpleChange} from "@angular/core";
import {TypedSimpleChanges} from "../effect-on-changes$";

/**
 * @internal
 * @param changes
 */
export function mapChanges<I>(changes: Partial<TypedSimpleChanges<I>>): I {
  const t: I = {} as I;
  Object.entries(changes).forEach((entry) => {
    const key = entry[0];
    const value: SimpleChange = entry[1];

    t[key] = value.currentValue;
  });

  return t;
}
