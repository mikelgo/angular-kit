import {NgForOf} from '@angular/common';
import {Component} from '@angular/core';
import {RouterLinkActive, RouterLinkWithHref,} from '@angular/router';
import {routes} from "../app.routes";


@Component({
  selector: 'app-nav',
  template: `
    <div *ngFor="let item of navItems">
      <a [routerLink]="item.path" routerLinkActive="active"> {{item.label}}</a>
    </div>
  `,
  styles: [
    `
    :host {
      display: flex;
      gap: 16px;
      padding: 16px;
      border-bottom: 2px solid blue;
      margin-bottom: 16px;
    }

    .active {
      border-bottom: 4px solid black;
    }
  `,
  ],
  imports: [RouterLinkActive, RouterLinkWithHref, NgForOf],
  standalone: true,
})
export class NavComponent {
  navItems = routes.map((route) => {
    return {
      path: route.path,
      label: route.path,
    };
  });
}
