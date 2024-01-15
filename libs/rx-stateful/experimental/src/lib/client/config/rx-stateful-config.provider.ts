import {inject, InjectionToken} from "@angular/core";
import {RxStatefulConfig, RefetchStrategy} from "@angular-kit/rx-stateful";
import {makeFeature} from "./config-feature";


export type Config<T, E> = Pick<RxStatefulConfig<T, E>,
    'keepErrorOnRefresh'
    | 'keepValueOnRefresh'
    | 'errorMappingFn'
    | 'beforeHandleErrorFn'
    | 'accumulationFn'> & {
    autoRefetch?: RefetchStrategy;
}
export const RX_STATEFUL_CONFIG = <T,E>() => new InjectionToken<Config<T, E>>('RX_STATEFUL_CONFIG');


export function withConfig<T, E>(config: Config<T, E>) {
    return makeFeature('Config', [{ provide: RX_STATEFUL_CONFIG, useValue: config }]);
}
export function injectRxStatefulConfig<T, E>(): Config<T, E> {
    return inject(RX_STATEFUL_CONFIG, {optional: true});
}




