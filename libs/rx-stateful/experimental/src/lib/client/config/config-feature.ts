import {Provider} from "@angular/core";

export type FeatureKind = 'Config';

export interface RxStatefulClientFeature {
    kind: FeatureKind;
    providers: Provider[];
}

export function makeFeature(kind: FeatureKind, providers: Provider[]) {
    return {
        kind,
        providers,
    };
}
