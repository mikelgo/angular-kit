import {RxStatefulConfig, SourceTriggerConfig} from "../types/types";

export function deriveConfigFromParams<T, A, E = unknown>(
    configOrSourceTrigger?: RxStatefulConfig<T, E> | SourceTriggerConfig<A>,
    config?: RxStatefulConfig<T, E>,
): RxStatefulConfig<T, E> | undefined {
    let configFromParams: RxStatefulConfig<T, E> | undefined = undefined
    if (configOrSourceTrigger && config){
        throw new Error('You can only pass either a config or a sourceTriggerConfig')
    }
    if (config) {
        configFromParams = config
    } else {
        if (configOrSourceTrigger) {
                configFromParams = configOrSourceTrigger as RxStatefulConfig<T, E>
        }
    }
    return configFromParams
}
