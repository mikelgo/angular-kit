import {NgModule, Pipe, PipeTransform} from '@angular/core';
import {CommonModule} from '@angular/common';

export type RunFnExpression<T> = (...args: any[]) => T

@Pipe({
  name: 'runFn',
})
export class RunFnPipe implements PipeTransform {
  transform<T>(fn: RunFnExpression<T>, ...args: any[]): T {
    if (!fn) {
      throw new Error('fn is required');
    }
    return fn(...args);
  }
}

@NgModule({
  imports: [CommonModule],
  declarations: [RunFnPipe],
  exports: [RunFnPipe],
})
export class RunFnPipeModule {}
