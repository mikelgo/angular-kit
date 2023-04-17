import {Pipe, PipeTransform} from '@angular/core';
import {ProviderFn, RunFnExpression} from "../types/types";
import {from, map, Observable} from "rxjs";

@Pipe({
  name: 'lazy',
  standalone: true,
})
export class LazyPipe implements PipeTransform {
  transform<R>(fn: RunFnExpression<R>, providerFn: ProviderFn): Observable<R> {
    return from(providerFn()).pipe(map(fn));

  }
}
