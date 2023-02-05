import {NgModule, Pipe, PipeTransform} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ProviderFn, RunFnExpression} from "../types/types";
import {from, map, Observable} from "rxjs";

@Pipe({
  name: 'lazy',
})
export class LazyPipe implements PipeTransform {
  transform<R>(fn: RunFnExpression<R>, providerFn: ProviderFn): Observable<R> {
    return from(providerFn()).pipe(map(fn));

  }
}

@NgModule({
  imports: [CommonModule],
  declarations: [LazyPipe],
  exports: [LazyPipe],
})
export class LazyPipeModule {}
