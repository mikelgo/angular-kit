import { MonoTypeOperatorFunction } from "rxjs";
import { distinctUntilChanged } from "rxjs/operators";

/**
 * @description
 *
 * Returns an Observable that emits all items emitted by the source Observable that are distinct by comparison from
 * the previous item. Comparison will be done for each set key in the `keys` array.
 *
 * You can fine grain your distinct checks by providing a `KeyCompareMap` with those keys you want to compute
 * explicitly different
 *
 * The name `distinctUntilSomeChanged` was picked since it internally iterates over the `keys` and utilizes the
 * [some](https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Array/some) method in order to
 * compute if values are distinct or not.
 *
 * @example
 *
 * import { of } from 'rxjs';
 * import { distinctUntilSomeChanged } from 'rx-angular/state';
 *
 * interface Person {
 *    age: number;
 *    name: string;
 * }
 *
 * of(
 *   { age: 4, name: 'Hans'},
 *   { age: 7, name: 'Sophie'},
 *   { age: 5, name: 'Han Solo'},
 *   { age: 5, name: 'HanSophie'},
 * ).pipe(
 *   distinctUntilSomeChanged(['age', 'name']),
 * )
 * .subscribe(x => console.log(x));
 *
 * // displays:
 * // { age: 4, name: 'Hans'}
 * // { age: 7, name: 'Sophie'}
 * // { age: 5, name: 'Han Solo'}
 * // { age: 5, name: 'HanSophie'}
 *
 * @example
 * // An example with `KeyCompareMap`
 * import { of } from 'rxjs';
 * import { distinctUntilSomeChanged } from 'rxjs/operators';
 *
 * interface Person {
 *     age: number;
 *     name: string;
 *  }
 * const customComparison: KeyCompareMap<Person> = {
 *   name: (oldName, newName) => oldName.substring(0, 2) === newName.substring(0, 2)
 * };
 *
 * of(
 *     { age: 4, name: 'Hans'},
 *     { age: 7, name: 'Sophie'},
 *     { age: 5, name: 'Han Solo'},
 *     { age: 5, name: 'HanSophie'},
 *   ).pipe(
 *     distinctUntilSomeChanged(['age', 'name'], customComparison),
 *   )
 *   .subscribe(x => console.log(x));
 *
 * // displays:
 * // { age: 4, name: 'Hans' }
 * // { age: 7, name: 'Sophie' }
 * // { age: 5, name: 'Han Solo' }
 *
 * @param keys String key for object property lookup on each item.
 * @param [keyCompareMap] Optional KeyCompareMap to explicitly define comparisons for some of the keys
 * @docsPage distinctUntilSomeChanged
 * @docsCategory operators
 */
export function rxDistinctUntilKeysChange<T extends object, K extends keyof T>(
    keys: Array<K>,
    keyCompareMap?: KeyCompareMap<T>
): MonoTypeOperatorFunction<T> {
    // default compare function applying === to every key
    let distinctCompare: CompareFn<T> = (oldState, newState) =>
        keys.some(key => !defaultCompare(safePluck(oldState, [key]), safePluck(newState, [key])));

    // generate compare function respecting every case of provided keyCompareMap
    if (keyCompareMap !== undefined) {
        const compare = (key: K) => {
            // eslint-disable-next-line no-prototype-builtins
            return keyCompareMap.hasOwnProperty(key) && keyCompareMap[key] !== undefined
                ? (keyCompareMap[key] as CompareFn<T[K]>)
                : defaultCompare;
        };
        distinctCompare = (oldState, newState) => {
            return keys.some(key => !compare(key)(safePluck(oldState, [key]), safePluck(newState, [key])));
        };
    }
    return distinctUntilChanged((oldV, newV) => !distinctCompare(oldV, newV));
}

function isObjectGuard(obj: unknown): obj is object {
    return obj !== null && obj !== undefined && typeof obj === 'object' && !Array.isArray(obj);
}

function isKeyOf<O>(k: unknown): k is keyof O {
    const typeofK = typeof k;
    return k !== null && k !== undefined && ['string', 'symbol', 'number'].includes(typeofK);
}

function isDefined(val: unknown): val is NonNullable<any> {
    return val !== null && val !== undefined;
}

function safePluck<T extends object, K1 extends keyof T>(stateObject: T, keys: K1 | [K1]): T[K1];

function safePluck<T extends object, K1 extends keyof T, K2 extends keyof T[K1]>(
    stateObject: T,
    keys: [K1, K2]
): T[K1][K2];

function safePluck<T extends object, K1 extends keyof T, K2 extends keyof T[K1], K3 extends keyof T[K1][K2]>(
    stateObject: T,
    keys: [K1, K2, K3]
): T[K1][K2][K3];

function safePluck<
    T extends object,
    K1 extends keyof T,
    K2 extends keyof T[K1],
    K3 extends keyof T[K1][K2],
    K4 extends keyof T[K1][K2][K3]
>(stateObject: T, keys: [K1, K2, K3, K4]): T[K1][K2][K3][K4];

function safePluck<
    T extends object,
    K1 extends keyof T,
    K2 extends keyof T[K1],
    K3 extends keyof T[K1][K2],
    K4 extends keyof T[K1][K2][K3],
    K5 extends keyof T[K1][K2][K3][K4]
>(stateObject: T, keys: [K1, K2, K3, K4, K5]): T[K1][K2][K3][K4][K5];

function safePluck<
    T extends object,
    K1 extends keyof T,
    K2 extends keyof T[K1],
    K3 extends keyof T[K1][K2],
    K4 extends keyof T[K1][K2][K3],
    K5 extends keyof T[K1][K2][K3][K4],
    K6 extends keyof T[K1][K2][K3][K4][K5]
>(
    stateObject: T,
    keys: [K1] | [K1, K2] | [K1, K2, K3] | [K1, K2, K3, K4] | [K1, K2, K3, K4, K5] | [K1, K2, K3, K4, K5, K6]
): T[K1][K2][K3][K4][K5][K6];

function safePluck<
    T extends object,
    K1 extends keyof T,
    K2 extends keyof T[K1],
    K3 extends keyof T[K1][K2],
    K4 extends keyof T[K1][K2][K3],
    K5 extends keyof T[K1][K2][K3][K4],
    K6 extends keyof T[K1][K2][K3][K4][K5]
>(
    stateObject: T,
    keys: [K1] | [K1, K2] | [K1, K2, K3] | [K1, K2, K3, K4] | [K1, K2, K3, K4, K5] | [K1, K2, K3, K4, K5, K6]
):
    | T[K1]
    | T[K1][K2]
    | T[K1][K2][K3]
    | T[K1][K2][K3][K4]
    | T[K1][K2][K3][K4][K5]
    | T[K1][K2][K3][K4][K5][K6]
    | null
    | undefined {
    // needed to match null and undefined conventions of RxAngular core components
    // safePluck(null) -> return null
    // safePluck(undefined) -> return undefined
    // safePluck(obj, ['wrongKey']) -> return undefined
    // safePluck(obj, ['correctKey']) -> return value of key
    // safePluck(obj, '') -> return undefined
    // safePluck(obj, null) -> return undefined
    if (!isDefined(stateObject)) {
        return stateObject;
    }
    if (!isDefined(keys)) {
        return undefined;
    }
    // sanitize keys -> keep only valid keys (string, number, symbol)
    const keysArr = (Array.isArray(keys) ? keys : [keys]).filter(k => isKeyOf<T>(k));
    if (keysArr.length === 0 || !isObjectGuard(stateObject) || Object.keys(stateObject).length === 0) {
        return undefined;
    }
    let prop = stateObject[keysArr.shift() as K1];

    keysArr.forEach(key => {
        if (isObjectGuard(prop) && isKeyOf(key)) {
            prop = prop[key];
        }
    });
    return prop;
}

/**
 * @description
 * The function which is used by `KeyCompareMap` to determine if changes are distinct or not.
 * Should return true if values are equal.
 *
 * @param {T} oldVal
 * @param {T} newVal
 *
 * @return boolean
 *
 * @docsPage interfaces
 * @docsCategory operators
 */
type CompareFn<T> = (oldVal: T, newVal: T) => boolean;

/**
 * @description
 * The `KeyCompareMap` is used to configure custom comparison for defined keys.
 *
 * @example
 * const keyCompareMap = {
 *    myKey: (o, n) => customCompare(o, n)
 *  };
 *  const o$ = of({
 *    myKey: 5,
 *    myOtherKey: 'bar'
 *  }).pipe(distinctUntilSomeChanged(['myKey', 'myOtherKey'], keyCompareMap));
 *
 *  //or
 *
 *  const o$ = of({
 *    myKey: 5,
 *    myOtherKey: 'bar'
 *  }).pipe(selectSlice(['myKey', 'myOtherKey'], keyCompareMap));
 *
 * @docsPage interfaces
 * @docsCategory operators
 */
export type KeyCompareMap<T extends object> = {
    [K in keyof Partial<T>]: CompareFn<T[K]>;
};

/**
 * @internal
 */
function defaultCompare<T>(oldVal: T, newVal: T): boolean {
    return oldVal === newVal;
}
