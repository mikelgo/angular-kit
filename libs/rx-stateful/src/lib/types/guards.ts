import {RxStatefulSignalConfig} from "./types";

export function isRxStatefulSignalConfigGuard(value: any): value is RxStatefulSignalConfig {
  return !!(value as RxStatefulSignalConfig)?.useSignals
}
