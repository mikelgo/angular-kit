import {map, Observable} from 'rxjs';
import {Stateful} from '@angular-kit/rx-stateful';

type ResponseTypes = 'hasValue' | 'hasError' | 'error' | 'value' | 'state' | 'context';

// TODO responsetype should be infered correctly
/*export function pickResponseType<T, E>(): Observable<Stateful<T,  E>>
export function pickResponseType<T, E>(responseType: 'hasError'): Observable<boolean>;
export function pickResponseType<T, E>(responseType: 'hasValue'): Observable<boolean>;
export function pickResponseType<T, E>(responseType: 'error'): Observable<E>;
export function pickResponseType<T, E>(responseType: 'value'): Observable<T | undefined | null>;
export function pickResponseType<T, E>(responseType: 'state'): Observable<Stateful<T,  E>>
export function pickResponseType<T, E>(responseType: 'context'): Observable<RxStatefulContext>*/
export function pickResponseType<T, E>(responseType?: ResponseTypes) {
    return function <T>(source: Observable<Stateful<T, E>>) {
        return source.pipe(
            map((v) => {
                switch (responseType) {
                    case 'hasError':
                        return v.hasError
                    case 'hasValue':
                        return v.hasValue
                    case 'error':
                        return v.error
                    case 'value':
                        return v.value

                    case 'context':
                        return v.context
                    case 'state':
                    default:
                        return v
                }
            })
        );
    };
}




