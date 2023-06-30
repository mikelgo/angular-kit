import {RxStatefulSignalConfig} from './types';

export function isRxStatefulSignalConfigGuard(value: any): value is RxStatefulSignalConfig<any, any> {
  return !!(value as RxStatefulSignalConfig<any, any>)?.useSignals;
}
