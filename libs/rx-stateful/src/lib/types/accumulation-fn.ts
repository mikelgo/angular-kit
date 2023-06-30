import {InternalRxState} from './types';

export type RxStatefulAccumulationFn<T, E> = (
  acc: InternalRxState<T, E>,
  val: Partial<InternalRxState<T, E>>
) => InternalRxState<T, E>;

export const defaultAccumulationFn: RxStatefulAccumulationFn<any, any> = (acc, val) => ({ ...acc, ...val });
