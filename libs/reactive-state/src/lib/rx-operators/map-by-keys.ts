import { map, OperatorFunction } from "rxjs";

/**
 * Rxjs Operator that selects properties of T by its keys and returns a Partial<T> by the selected
 * properties.
 *
 * @example
 * interface Person {id: number, name: string; firstName: string}
 *
 * const partialPerson$ = person$.pipe(
 *      mapByKeys(['id', 'firstName'])
 *      )
 *      --> returns Observable<{id: number, firstName: string}>
 */
export function mapByKeys<T>(keys: Array<keyof T>): OperatorFunction<T, Partial<T>> {
    return map(value => {
        const selectedProps: Partial<T> = {};
        for (const key of keys) {
            selectedProps[key] = value[key];
        }
        return selectedProps;
    });
}
