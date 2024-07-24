import {Component, inject, Injectable} from '@angular/core';
import { CommonModule } from '@angular/common';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {delay, of, scan, Subject, switchMap, timer} from "rxjs";
import {RxStateful, rxStateful$, withAutoRefetch, withRefetchOnTrigger} from "@angular-kit/rx-stateful";
import {Todo} from "../types";
import {RxStatefulStateVisualizerComponent} from "./rx-stateful-state-visualizer.component";

type Data = {
  id: number;
  name: string
}

const DATA: Data[] = [
  {id: 1, name: 'ahsd'},
  {id: 2, name: 'asdffdsa'},
  {id: 3, name: 'eeasdf'},
]

@Injectable({providedIn: 'root'})
export class DataService {
  private readonly http = inject(HttpClient)


  getData(opts?: {delay?: number}){
    return timer(opts?.delay ?? 1000).pipe(
      switchMap(() => of(DATA))
    )
  }
}

@Component({
  selector: 'demo-all-use-cases',
  standalone: true,
  imports: [CommonModule, RxStatefulStateVisualizerComponent],
  templateUrl: './all-use-cases.component.html',
  styleUrl: './all-use-cases.component.scss',
})
export class AllUseCasesComponent {
  private readonly data = inject(DataService)
  readonly refresh$$ = new Subject<null>()
  refreshInterval = 10000
  /**
   * Für alle Use Cases eine demo machen
   */

  /**
   * Case 1
   * Basic Usage with automatic refetch and a refreshtrigger
   */
  case1$ = rxStateful$<Data[], Error>(
    this.data.getData(),
    {
      refetchStrategies: [
        withRefetchOnTrigger(this.refresh$$),
        //withAutoRefetch(this.refreshInterval, 1000000)
      ],
      suspenseThresholdMs: 500,
      suspenseTimeMs: 1000,
      keepValueOnRefresh: false,
      keepErrorOnRefresh: false,
      errorMappingFn: (error) => error.message,
    }
  ).pipe(
    scan<RxStateful<Data[]>, {
      index: number;
      value: RxStateful<any>
    }[]>((acc, value, index) => {
      // @ts-ignore
      acc.push({ index, value });

      return acc;
    }, [])
  )

  /**
   * Case Basic Usage non flickering
   */

  /**
   * Case Basic Usage flaky API
   */
  //case2$

  /**
   * Case - sourcetrigger function
   */


  /**
   * Case  - sourcetrigger function non flickering
   */

  /**
   * Case - sourcetrigger function flaky api
   */
}
