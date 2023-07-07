import {InternalRxState, RxStatefulConfig} from "../types/types";

export function calcStartValueForRefresh<T, E>(mergedConfig: RxStatefulConfig<T,E>): Partial<InternalRxState<T, E>>{
  let baseStartWithValue: Partial<InternalRxState<T, E>> = { isLoading: true, isRefreshing: true, context: 'suspense'};
  if (!mergedConfig?.keepValueOnRefresh) {
    baseStartWithValue = { ...baseStartWithValue, value: null };
  }
  if(!mergedConfig?.keepErrorOnRefresh) {
    baseStartWithValue = { ...baseStartWithValue, error: undefined };
  }

  return baseStartWithValue;
}
