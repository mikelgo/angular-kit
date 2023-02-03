import {Observable, Subject, throwError} from "rxjs";

export function createSourceTrigger(): Subject<Observable<any>> {
  return new Subject<Observable<unknown>>();
}
export function createError () {
  return new Error('🔥');
}

export function createErrorSource(error: any) {
  return throwError(() => error)
}
