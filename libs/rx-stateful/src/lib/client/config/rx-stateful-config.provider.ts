import {inject, InjectionToken} from "@angular/core";
import {RxStatefulConfig} from "../../types/types";
import {makeFeature} from "./config-feature";
import {AutoRefetchStrategy} from "../../refetch-strategies/refetch-strategy";


export type Config<T, E> = Pick<RxStatefulConfig<T, E>,
    'keepErrorOnRefresh'
    | 'keepValueOnRefresh'
    | 'errorMappingFn'
    | 'beforeHandleErrorFn'
    | 'accumulationFn'> & {
    periodicRefetch: AutoRefetchStrategy;
}
export const RX_STATEFUL_CONFIG = <T,E>() => new InjectionToken<Config<T, E>>('RX_STATEFUL_CONFIG');


export function withConfig<T, E>(config: Config<T, E>) {
    return makeFeature('Config', [{ provide: RX_STATEFUL_CONFIG, useValue: config }]);
}
export function injectRxStatefulConfig<T, E>(): Config<T, E> {
    return inject(RX_STATEFUL_CONFIG, {optional: true});
}




