import {InternalRxState, RxStatefulConfig} from "../types/types";

export function calcStartValueForRefresh<T, E>(mergedConfig: RxStatefulConfig<T,E>): Partial<InternalRxState<T, E>>{
  let baseStartWithValue: Partial<InternalRxState<T, E>> = { isLoading: true, isRefreshing: true, context: 'suspense', error: undefined };
  if (!mergedConfig?.keepValueOnRefresh) {
    baseStartWithValue = { ...baseStartWithValue, value: null };
  }

  return baseStartWithValue;
}
