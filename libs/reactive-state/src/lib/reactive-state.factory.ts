import {
  ChangeDetectorRef,
  DestroyRef,
  inject,
  Injector,
  OnChanges,
  runInInjectionContext,
  ViewRef
} from '@angular/core';
import { State } from './types/state';
import { ReactiveState } from './reactive-state';

/**
 * Teardown function which gets executed when {@link ReactiveState} instance
 * is destroyed
 *
 * @example
 * const fn = () => console.log
 */
export type TeardownFn = () => void;

/**
 * Function to setup {@link ReactiveState} instance.
 *
 * @example
 * const setupFn = state => {
 *     state.initialize(...)
 * }
 *
 * or you can also use object destructuring:
 * const setupFn = ({initialize, connect}) => {
 *     initialize(...)
 *     connect(...)
 * }
 *
 * Optionally you can return a {@link TeardownFn} with logic that should be executed
 * when the instance of {@link ReactiveState} gets destroyed
 * const setupFn = ({initialize}) => {
 *     initialize()
 *
 *     return () => window.localStorage.set(...)
 * }
 *
 */
export type SetupFn<T extends State> = (
    state: Pick<ReactiveState<T>, 'connect' | 'initialize' | 'useAccumulatorFn' | 'select'>
) => TeardownFn | void;


/**
 * Creates a instance of a lightweight state container
 *
 * @example
 * const state = reactiveState(({connect, initialize}) => {
 *     initialize({...})
 *     connect({...)})
 * })
 */
export function reactiveState<T extends State>(setupFn?: SetupFn<T>, options?: {
  injector?: Injector
}): ReactiveState<T> {
    const injector = options?.injector ?? inject(Injector)
    return runInInjectionContext(injector, () => {
      const state = new ReactiveState<T>();

      const teardown = setupFn?.({
        connect: state.connect.bind(state),
        useAccumulatorFn: state.useAccumulatorFn.bind(state),
        select: state.select.bind(state),
        initialize:  state.initialize.bind(state)
      });

      onDestroy(() => {
        state.ngOnDestroy();
        if (teardown) {
          teardown();
        }
      });
      return state;
    })

}

function onDestroy(teardown: TeardownFn) {
    const viewRef = inject(DestroyRef) ;

    viewRef?.onDestroy(() => {
        teardown();
    });
}
