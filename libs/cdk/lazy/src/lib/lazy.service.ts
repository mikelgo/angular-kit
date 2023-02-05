import {Injectable} from '@angular/core';
import {ProviderFn, RunFnExpression} from "./types/types";
import {from, map, Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class LazyService {

  run<R>(fn: RunFnExpression<R>, providerFn: ProviderFn): Observable<R>{
    return from(providerFn()).pipe( map(fn));
  }
}
