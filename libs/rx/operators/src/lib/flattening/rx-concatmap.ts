import {concatMap, Observable, OperatorFunction, pipe, RetryConfig} from "rxjs";
import {ErrorHandlingStrategy, ProjectFn} from "./types";
import {deriveErrorHandlingStrategy} from "./internal/utils";

/**
 * RxJs concatMap operator with error handling
 */
export function rxConcatmap<T,R>(project: ProjectFn<T, R>): OperatorFunction<T, R>;
export function rxConcatmap<T,R>(project: ProjectFn<T, R>, customErrorHandlingStrategy: OperatorFunction<T, R>): OperatorFunction<T, R>;
export function rxConcatmap<T,R>(project: ProjectFn<T, R>, errorHandlingStrategy: ErrorHandlingStrategy): OperatorFunction<T, R>;
export function rxConcatmap<T,R>(project: ProjectFn<T, R>, retryConfig: RetryConfig ): OperatorFunction<T, R>;
export function rxConcatmap<T,R>(project: ProjectFn<T, R>, strategyOrConfig?: ErrorHandlingStrategy | OperatorFunction<T, R> | RetryConfig): OperatorFunction<T, R> {
  const { defaultErrorHandling, retryErrorHandling } = deriveErrorHandlingStrategy(strategyOrConfig);

  return (source: Observable<T>) => source.pipe(
    concatMap((value, index) => project(value, index).pipe(
      retryErrorHandling ? retryErrorHandling : pipe(),
      defaultErrorHandling
    )),

  );
}
