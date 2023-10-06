import { Observable, of } from 'rxjs';

export function coerceObservable<T>(value: T | Observable<T>): Observable<T> {
    return value instanceof Observable ? value : of(value);
}