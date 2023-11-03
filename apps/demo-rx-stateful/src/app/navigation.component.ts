import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import {MatTabsModule} from "@angular/material/tabs";
import {NgForOf} from "@angular/common";
import {appRoutes} from "./app.routes";

@Component({
  standalone: true,
  imports: [RouterModule, MatTabsModule, NgForOf],
  selector: 'navigation',
  template: `
    <nav mat-tab-nav-bar  [tabPanel]="tabPanel">
      <a mat-tab-link *ngFor="let link of links"
         (click)="activeLink = link"
         [active]="activeLink == link"
      [routerLink]="link.path"> {{link.title}} </a>

    </nav>
    <mat-tab-nav-panel #tabPanel>
      <router-outlet></router-outlet>
    </mat-tab-nav-panel>
  `,
  styles: [``],
})
export class NavigationComponent {

  title = 'demo-rx-stateful';
  links = appRoutes

  activeLink = this.links[0];
}
