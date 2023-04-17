import {Pipe, PipeTransform} from '@angular/core';

export type RunFnExpression<T> = (...args: any[]) => T

@Pipe({
  name: 'runFn',
  standalone: true,
})
export class RunFnPipe implements PipeTransform {
  transform<T>(fn: RunFnExpression<T>, ...args: any[]): T {
    if (!fn) {
      throw new Error('fn is required');
    }
    return fn(...args);
  }
}
