import {Component, inject} from '@angular/core';
import { RouterModule } from '@angular/router';
import {MatButtonModule} from "@angular/material/button";
import {async, delay, Subject} from "rxjs";
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {rxStateful$, withAutoRefetch, withRefetchOnTrigger} from "@angular-kit/rx-stateful";
import {AsyncPipe, NgForOf, NgIf} from "@angular/common";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import { Todo } from '../types';
import {MatListModule} from "@angular/material/list";
import {HighlightModule} from "ngx-highlightjs";
import {MatExpansionModule} from "@angular/material/expansion";
import {TodoItemComponent} from "./todo-item.component";
import {MatCardModule} from "@angular/material/card";

@Component({
  standalone: true,
  imports: [RouterModule, MatButtonModule, NgIf, AsyncPipe, MatProgressSpinnerModule, MatListModule, NgForOf, HighlightModule, MatExpansionModule, TodoItemComponent, MatCardModule],
  selector: 'demo-basic-usage',
  template: `
    <h1>Basic Usage</h1>
    <mat-expansion-panel>
      <mat-expansion-panel-header>
        Code example
      </mat-expansion-panel-header>
      <pre><code [highlight]="code"></code></pre>
    </mat-expansion-panel>
    <div>
      <p>You can refetch the list by pressing refresh</p>
      <p>Automatically after {{refreshInterval}}ms it will also refresh</p>
    </div>
    <div>
      <button mat-button color="primary" (click)="refresh$$.next(null)"> Refresh </button>
      <br>
      <mat-card class="px-8 py-4 h-[400px]">
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
          <div class="w-full h-full grid place-items-center\t"><mat-spinner></mat-spinner></div>
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
  styles: [`
  .list-container {
    max-height: 400px;
    overflow: scroll;
  }
  `],
})
export class DemoBasicUsageComponent {
  /**
   * todo
   * enhabnce with flaky api
   * enhance that one can set from demo autorefetch strategy
   * @private
   */
  private readonly http = inject(HttpClient)
  readonly refresh$$ = new Subject<null>()
  refreshInterval = 10000

  state$ = rxStateful$<Todo[], HttpErrorResponse>(
    this.http.get<Todo[]>('https://jsonplaceholder.typicode.com/todos').pipe(
      // simulate slow network
      delay(2000)
    ),
    {
      refetchStrategies: [
        withRefetchOnTrigger(this.refresh$$),
        withAutoRefetch(this.refreshInterval, 1000000)
      ],
      errorMappingFn: (error) => error.message,
    }
  )



  code = `
  private readonly http = inject(HttpClient)
  readonly refresh$$ = new Subject<null>()
  refreshInterval = 10000

  state$ = rxStateful$<Todo[], HttpErrorResponse>(
    this.http.get<Todo[]>('https://jsonplaceholder.typicode.com/todos').pipe(
      // simulate slow network
      delay(2000)
    ),
    {
      refetchStrategies: [
        withRefetchOnTrigger(this.refresh$$),
        withAutoRefetch(this.refreshInterval, 1000000)
      ],
      errorMappingFn: (error) => error.message,
    }
  )
  `


}
