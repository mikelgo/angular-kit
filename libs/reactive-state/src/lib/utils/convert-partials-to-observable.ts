import { combineLatest, debounceTime, map, Observable, startWith } from 'rxjs';
import { State } from '../types/state';

export function convertPartialsToObservable<T extends State>(
    input: Partial<{ [P in keyof T]: Observable<T[P]> }>
): Observable<Partial<T>> {
    const keys = Object.keys(input);
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    const observables = keys.map(key => input[key]?.pipe(startWith(undefined)));

    return combineLatest(observables).pipe(
        map(values => {
            const result: Partial<T> = {};
            for (let i = 0; i < keys.length; i++) {
                // @ts-ignore
                result[keys[i]] = values[i];
            }
            return result;
        }),
        debounceTime(0)
    );
}