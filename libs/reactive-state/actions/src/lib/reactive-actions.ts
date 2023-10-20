import { ErrorHandler, inject } from "@angular/core";
import { Actions, ActionTransforms, ReactiveActions } from "./types";
import { ReactiveActionFactory } from "./actions.factory";

/**
 * Manage events in components and services in a single place
 *
 * @example
 *
 * interface UI {
 *  search: string,
 *  submit: void
 * };
 *
 * import { reactiveActions } from '@devkit/actions';
 *
 * @Component({...})
 * export class Component {
 *   ui = reactiveActions<{ name: string }>(({transforms}) => transforms({name: v => v}));
 *
 *   name$ = this.ui.name$; // Observable<string> - listens to name changes
 *   emitName = this.ui.name; // (name: string) => void - emits name change
 *   sub = this.ui.onName(o$ => o$.pipe(), console.log) // () => void - stops side effect
 *
 *   onInit() {
 *     const name$ = this.ui.name$; // Observable<string> - listens to name changes
 *     const emitName = this.ui.name; // (name: string) => void - emits name change
 *     const stop = this.ui.onName(o$ => o$.pipe(), console.log) // () => void - stops side effect
 *     stop();
 *   }
 *
 * }
 *
 */
export function reactiveActions<T extends Partial<Actions>, U extends ActionTransforms<T> = object>(
    setupFn?: (cfg: { transforms: (t: U) => void }) => void
): ReactiveActions<T, U> {
    // todo Angular-16
    // assertInInjectionContext(rxActions);
    const errorHandler = inject(ErrorHandler, { optional: true });
    const factory = new ReactiveActionFactory<T>(errorHandler);
    let transformsMap = {} as U;

    // run setup function if given
    setupFn &&
        setupFn({
            transforms: (t: U) => (transformsMap = t)
        });

    return factory.create<U>(transformsMap);
}

