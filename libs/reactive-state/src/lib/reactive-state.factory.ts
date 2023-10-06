import { ChangeDetectorRef, inject, OnChanges, ViewRef } from '@angular/core';
import { useOnChanges$ } from '@devkit/cdk';
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

export type Config<T, C extends OnChanges = any> = {
    connectInputs?: C;
};

/**
 * @internal
 */
type InternalConfig<T, C extends OnChanges> = {
    connectInputs?: C;
};

/**
 * Creates a instance of a lightweight state container
 *
 * @example
 * const state = reactiveState(({connect, initialize}) => {
 *     initialize({...})
 *     connect({...)})
 * })
 */
export function reactiveState<T extends State>(setupFn?: SetupFn<T>, cfg?: Config<T>): ReactiveState<T> {
    const state = new ReactiveState<T>();
    const mergedConfig: InternalConfig<T, any> = {
        ...cfg
    };

    // @ts-ignore
    const teardown = setupFn?.({
        connect: state.connect.bind(state),
        useAccumulatorFn: state.useAccumulatorFn.bind(state),
        select: state.select.bind(state),
        // @ts-ignore prettier-ignore
        initialize: mergedConfig.connectInputs
            ? // @ts-ignore
              state.initialize.bind(state, useOnChanges$(mergedConfig.connectInputs))
            : state.initialize.bind(state)
    });

    onDestroy(() => {
        state.ngOnDestroy();
        if (teardown) {
            teardown();
        }
    });
    return state;
}

function onDestroy(teardown: TeardownFn) {
    // todo Angular-16: replace with DestroyRef
    const viewRef = inject(ChangeDetectorRef) as ViewRef;

    viewRef?.onDestroy(() => {
        teardown();
    });
}
