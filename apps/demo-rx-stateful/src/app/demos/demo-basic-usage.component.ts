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

@Component({
  standalone: true,
  imports: [RouterModule, MatButtonModule, NgIf, AsyncPipe, MatProgressSpinnerModule, MatListModule, NgForOf],
  selector: 'demo-basic-usage',
  template: `
    <h1>Basic Usage</h1>
    <div>
      <p>You can refetch the list by pressing refresh</p>
      <p>Automatically after {{refreshInterval}}ms it will also refresh</p>
    </div>
    <div>
      <button mat-flat-button color="primary" (click)="refresh$$.next(null)"> Refresh </button>
      <br>
      <div *ngIf="state$ | async as state">
        <ng-container *ngIf="state.value">
          <div class="list-container">
            <mat-list role="list" >
              <mat-list-item *ngFor="let item of state.value" role="listitem">
                <div>
                  {{item.title}}
                </div>
              </mat-list-item>
            </mat-list>
          </div>
        </ng-container>
        <ng-container *ngIf="state.isSuspense">
          <mat-spinner></mat-spinner>
        </ng-container>
        <ng-container *ngIf="state.hasError">
          <div>
            Error {{state.error}}
          </div>
        </ng-container>
      </div>
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





}
