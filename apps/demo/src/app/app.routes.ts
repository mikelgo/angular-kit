import {Route} from "@angular/router";
import {EffectComponent} from "./demos/effect/effect.component";
import {StreamVsAsyncComponent} from "./stream-vs-async/stream-vs-async.component";

export const routes: Route[] = [
    {
        component: EffectComponent,
        path: 'effect',
    },
    {
        component: StreamVsAsyncComponent,
        path: 'stream-vs-async',
    }
]
