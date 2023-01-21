import {catchError, EMPTY, MonoTypeOperatorFunction, of, OperatorFunction, retry, RetryConfig} from 'rxjs';
import {isErrorHandlingStrategyGuard, isOperatorFunctionGuard, isRetryConfigGuard} from './guards';
import {ErrorHandlingStrategy} from '../types';

export function deriveErrorHandlingStrategy<T, R>(
  strategyOrConfig?: ErrorHandlingStrategy | OperatorFunction<T, R> | RetryConfig
) {
  let defaultErrorHandling = catchError((error) => of(error));
  let retryErrorHandling: MonoTypeOperatorFunction<R> | null = null;

  const defaultRetryConfig: RetryConfig = { count: 2, delay: 1000, resetOnSuccess: true };
  if (strategyOrConfig) {
    if (isErrorHandlingStrategyGuard(strategyOrConfig)) {
      if (strategyOrConfig === 'swallow') {
        defaultErrorHandling = catchError(() => EMPTY);
      }
      if (strategyOrConfig === 'retry-default') {
        retryErrorHandling = retry(defaultRetryConfig);
      }
    }

    if (isRetryConfigGuard(strategyOrConfig)) {
      retryErrorHandling = retry(strategyOrConfig);
    }

    if (isOperatorFunctionGuard(strategyOrConfig)) {
      defaultErrorHandling = strategyOrConfig;
    }
  }

  return { defaultErrorHandling, retryErrorHandling };
}
