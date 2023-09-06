import {Route} from "@angular/router";
import {EffectComponent} from "./demos/effect/effect.component";
import {StreamVsAsyncComponent} from "./stream-vs-async/stream-vs-async.component";
import {DemoDirectivesComponent} from "./demos/demo-directives.component";
import {DemoRxStatefulComponent} from "./demos/demo-rx-stateful/demo-rx-stateful.component";
import {DemoStreamComponent} from "./demos/demo-stream/demo-stream.component";

export const routes: Route[] = [
    {
        component: EffectComponent,
        path: 'effect',
    },
    {
        component: StreamVsAsyncComponent,
        path: 'stream-vs-async',
    },
    {
        path: 'directives',
        component: DemoDirectivesComponent
    },
    {
        path: 'stream-directive',
        component: DemoStreamComponent
    },
    {
        path: 'rx-stateful',
        component: DemoRxStatefulComponent
    }
]
