import {RxStatefulConfig, SourceTriggerConfig} from "../types/types";
import {isRxStatefulConfigOrSourceTriggerConfigGuard} from "../types/guards";

export function deriveConfigFromParams<T, A, E = unknown>(
    configOrSourceTrigger?: RxStatefulConfig<T, E> | SourceTriggerConfig<A>,
    config?: RxStatefulConfig<T, E>,
): RxStatefulConfig<T, E> | undefined {
    let configFromParams: RxStatefulConfig<T, E> | undefined = undefined
    if (config) {
        configFromParams = config
    } else {
        if (configOrSourceTrigger) {
            if (isRxStatefulConfigOrSourceTriggerConfigGuard(configOrSourceTrigger)) {
                configFromParams = configOrSourceTrigger as RxStatefulConfig<T, E>
            }
        }
    }
    return configFromParams
}
