import {RxStatefulClientFeature} from "./config-feature";
import {Provider} from "@angular/core";
import {RxStatefulClient} from "../rx-stateful-client/rx-stateful-client.service";

export function provideRxStatefulClient(...features: RxStatefulClientFeature[]): Provider[] {
    return [RxStatefulClient, ...features.map((f) => f.providers)]
}
