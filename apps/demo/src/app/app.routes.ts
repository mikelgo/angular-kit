import {Route} from "@angular/router";
import {EffectComponent} from "./demos/effect/effect.component";
import {DemoDirectivesComponent} from "./demos/demo-directives.component";
import {DemoRxStatefulComponent} from "./demos/demo-rx-stateful/demo-rx-stateful.component";
import {DemoStreamComponent} from "./demos/demo-stream/demo-stream.component";
import {DemoErrorRxStatefulComponent} from "./demos/demo-error-rx-stateful/demo-error-rx-stateful.component";

export const routes: Route[] = [
    {
        component: EffectComponent,
        path: 'effect',
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
        path: 'rx-stateful/:id',
        component: DemoRxStatefulComponent
    },
  {
    path:'error-handling',
    component: DemoErrorRxStatefulComponent
  }
]
