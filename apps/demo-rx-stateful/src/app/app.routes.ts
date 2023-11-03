import { Route } from '@angular/router';
import {DemoPaginationComponent} from "./demos/demo-pagination.component";
import {DemoBasicUsageComponent} from "./demos/demo-basic-usage.component";

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

];
