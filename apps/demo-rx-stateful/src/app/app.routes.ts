import { Route } from '@angular/router';
import {DemoPaginationComponent} from "./demos/demo-pagination.component";
import {DemoBasicUsageComponent} from "./demos/demo-basic-usage.component";
import {AllUseCasesComponent} from "./all-use-cases/all-use-cases.component";

export const appRoutes: Route[] = [
  {
    title: 'basic usage',
    path: 'basic-usage',
    component: DemoBasicUsageComponent,
  },
  {
    title: 'pagination',
    path: 'pagination',
    component: DemoPaginationComponent,
  },
  {
    title: 'all-cases',
    path: 'all-cases',
    component: AllUseCasesComponent,
  },
];
