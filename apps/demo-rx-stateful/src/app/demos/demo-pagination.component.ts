import {Component, inject, ViewChild, AfterViewInit} from '@angular/core';
import { RouterModule } from '@angular/router';
import {MatExpansionModule} from "@angular/material/expansion";
import {HighlightModule} from "ngx-highlightjs";
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, delay, Observable, scan, Subject, switchMap} from "rxjs";
import {MatPaginator, MatPaginatorModule} from "@angular/material/paginator";
import {MatTableDataSource, MatTableModule} from "@angular/material/table";
import {Todo} from "../types";
import {rxStateful$, withRefetchOnTrigger} from "@angular-kit/rx-stateful";
import { DataSource } from '@angular/cdk/collections';
import {RxHooks$} from "@angular-kit/rx-hooks";
import {MatButtonModule} from "@angular/material/button";
import {AsyncPipe, NgForOf, NgIf} from "@angular/common";
import {MatListModule} from "@angular/material/list";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {TodoItemComponent} from "./todo-item.component";
import {MatCardModule} from "@angular/material/card";




@Component({
  standalone: true,
  imports: [RouterModule, MatExpansionModule, HighlightModule, MatPaginatorModule, MatTableModule, MatButtonModule, AsyncPipe, MatListModule, MatProgressSpinnerModule, NgForOf, NgIf, TodoItemComponent, MatCardModule],
  selector: 'demo-pagination',
  template: `
     <h1>Pagination Example</h1>
    <div>
      <p>Change pages by clicking next or previous page</p>
      <p>You can refetch the list by pressing refresh</p>
    </div>
    <div class="w-full flex gap-8">
      <button mat-button color="primary" (click)="page$$.next(-1)"> previous page </button>
      <button mat-button color="primary" (click)="page$$.next(1)"> next page </button>
      <button mat-button color="primary" (click)="refresh$$.next(null)"> Refresh current page </button>
      <button mat-button color="primary" *ngIf="page$ | async as page">    Current Page: {{page}} </button>

    </div>
    <mat-expansion-panel>
      <mat-expansion-panel-header>
        Code example
      </mat-expansion-panel-header>
      <pre><code [highlight]="code"></code></pre>
    </mat-expansion-panel>
    <div>
    <mat-card class="px-8 py-4 h-[350px]">
      <h2>Todos</h2>
      <div *ngIf="state$ | async as state">
        <ng-container *ngIf="state.value">
          <div class="list-container">
            <mat-list role="list" >

              <mat-list-item *ngFor="let item of state.value" role="listitem">
                <todo-item [todo]="item"/>

              </mat-list-item>

            </mat-list>
          </div>
        </ng-container>
        <ng-container *ngIf="state.isSuspense">
          <div class="w-full h-full grid place-items-center\t">
            <mat-spinner></mat-spinner>
          </div>
        </ng-container>
        <ng-container *ngIf="state.hasError">
          <div>
            Error {{state.error}}
          </div>
        </ng-container>
      </div>
    </mat-card>
    </div>
`,
  styles: [''],
  hostDirectives: [RxHooks$]
})
export class DemoPaginationComponent   {
  code = `
  private readonly http = inject(HttpClient)
  readonly refresh$$ = new Subject<null>()
  readonly page$$ = new BehaviorSubject(0)
  readonly page$ = this.page$$.pipe(
    scan((acc, curr) => acc + curr, 0)
  )

  state$ = rxStateful$(
    (page) => this.http.get<Todo[]>(\`https://jsonplaceholder.typicode.com/todos?_start=page&_limit=5\`).pipe(
      // artificial delay
      delay(500)
    ),
    {
      sourceTriggerConfig: {
        trigger: this.page$
      },
      refetchStrategies: withRefetchOnTrigger(this.refresh$$)
    }
  )
  `
  private readonly hooks$ = inject(RxHooks$)
  private readonly http = inject(HttpClient)
  readonly refresh$$ = new Subject<null>()
  readonly page$$ = new BehaviorSubject(0)
  readonly page$ = this.page$$.pipe(
    scan((acc, curr) => acc + curr, 0)
  )

  state$ = rxStateful$(
    (page) => this.http.get<Todo[]>(`https://jsonplaceholder.typicode.com/todos?_start=${page * 5}&_limit=5`).pipe(
      // artificial delay
      delay(500)
    ),
    {
      sourceTriggerConfig: {
        trigger: this.page$
      },
      refetchStrategies: withRefetchOnTrigger(this.refresh$$)
    }
  )

}
