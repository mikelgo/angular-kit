import {distinctUntilChanged, filter, map, Observable} from 'rxjs';
import {InternalRxState, RxStateful, RxStatefulConfig} from '../types/types';

/**
 * @internal
 */
export function createRxStateful<T, E>(state$: Observable<InternalRxState<T, E>>, config: RxStatefulConfig<T, E>): Observable<RxStateful<T, E> >{
    return state$.pipe(
        map((state, index) => {
            const value: RxStateful<T, E> = {
                      value: state.value,
                      hasValue: !!state.value,
                      hasError: !!state.error,
                      error: state.error,
                      isSuspense: state.isLoading || state.isRefreshing,
                      context: state.context,
            }
            /**
             * todo there is for sure a nicer way to do this.
             *
             * IF we don't do this we will have two emissions when we refresh and keepValueOnRefresh = true.
             */
            if (index !== 0 && !config.keepValueOnRefresh && (state.isLoading || state.isRefreshing)) {
                return {
                    ...value,
                    value: null
                } as RxStateful<T, E>;
            }
            if (!state.isLoading || !state.isRefreshing) {
                return {
                    ...value,
                    value: state.value
                } as RxStateful<T, E>;
            }
            return value;
        }),
        filter((value) => value !== undefined),
        distinctUntilChanged()
    )
  // return {
  //   value$: state$.pipe(
  //     map((state, index) => {
  //       /**
  //        * todo there is for sure a nicer way to do this.
  //        *
  //        * IF we don't do this we will have two emissions when we refresh and keepValueOnRefresh = true.
  //        */
  //       if (index !== 0 && !config.keepValueOnRefresh && (state.isLoading || state.isRefreshing)) {
  //         return null;
  //       }
  //       if (!state.isLoading || !state.isRefreshing) {
  //         return state.value;
  //       }
  //     }),
  //     filter((value) => value !== undefined)
  //   ),
  //   hasValue$: state$.pipe(map((state) => !!state.value)).pipe(distinctUntilChanged()),
  //   isSuspense$: state$.pipe(map((state) => state.isLoading || state.isRefreshing)).pipe(distinctUntilChanged()),
  //   hasError$: state$.pipe(map((state) => !!state.error)).pipe(distinctUntilChanged()),
  //   error$: state$.pipe(map((state) => state.error)),
  //   context$: state$.pipe(map((state) => state.context)),
  //   state$: state$.pipe(
  //     map((state) => ({
  //       value: state.value,
  //       hasValue: !!state.value,
  //       hasError: !!state.error,
  //       error: state.error,
  //       isSuspense: state.isLoading || state.isRefreshing,
  //       context: state.context,
  //     })),
  //     distinctUntilChanged()
  //   ),
  // };
}
