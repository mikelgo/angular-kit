import {coerceObservable} from './coerce-observable';
import {Observable} from 'rxjs';
import {waitForAsync} from '@angular/core/testing';

describe('coerceObservable', () => {
  it('should coerce a value to an observable', waitForAsync(() => {
    const value = 'test';
    const result = coerceObservable(value);
    expect(result).toBeInstanceOf(Observable);
    result.subscribe((v) => expect(v).toBe(value));
  }));
});
