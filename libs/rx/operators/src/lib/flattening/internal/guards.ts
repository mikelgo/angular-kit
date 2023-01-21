import {OperatorFunction, RetryConfig} from "rxjs";
import {ErrorHandlingStrategy} from "./types";

export function isRetryConfigGuard(arg: any): arg is RetryConfig {
  return arg && arg?.count && arg?.delay;
}

export function isOperatorFunctionGuard(arg: any): arg is OperatorFunction<any, any> {
  // check if theres a better way
  return arg
}

export function isErrorHandlingStrategyGuard(arg: any): arg is ErrorHandlingStrategy {
  return arg && arg === 'swallow' || arg === 'retry-default'
}
