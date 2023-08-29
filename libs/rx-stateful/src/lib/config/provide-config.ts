import {EnvironmentProviders, inject, InjectionToken, makeEnvironmentProviders} from "@angular/core";
import {RxStatefulConfig} from "../types/types";

type Config<T, E> = Pick<RxStatefulConfig<T, E>, 'keepValueOnRefresh' | 'keepErrorOnRefresh' | 'accumulationFn' | 'errorMappingFn' | 'beforeHandleErrorFn'>

/**
 * @internal
 */
const RX_STATEFUL_CONFIG = <T, E>() => InjectionToken <Config<T, E> >

/**
 * @publicApi
 *
 * Global configuration for {@link rxStateful$}.
 *
 * Provide this configuration in your environment providers.
 *
 * @param config
 */
export function provideRxStatefulConfig<T, E>(config: Config<T, E>): EnvironmentProviders {
    return makeEnvironmentProviders([
        {
            provide: RX_STATEFUL_CONFIG(),
            useValue: config,
        },
    ]);
}

/**
 * @internal
 *
 */
export function injectConfig<T, E>() {
    // todo Angular-16 assertInInjectionContext(injectConfig);

    return inject(RX_STATEFUL_CONFIG<T, E>(), {optional: true})
}

