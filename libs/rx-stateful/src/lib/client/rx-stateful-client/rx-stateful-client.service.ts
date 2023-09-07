import {Injectable} from '@angular/core';
import {injectRxStatefulConfig} from "../config/rx-stateful-config.provider";
import {Observable} from "rxjs";
import {RxStateful, RxStatefulConfig} from "../../types/types";
import {rxStateful$} from "../../rx-stateful$";

export type RxStatefulRequestOptions<T, E> = RxStatefulConfig<T, E>;

@Injectable({
  providedIn: 'root'
})
export class RxStatefulClient<T,E> {

  private readonly config = injectRxStatefulConfig<T,E>();

  // todo generics on method level
  request(source$: Observable<T>): RxStateful<T, E>
  request(source$: Observable<T>, options: RxStatefulRequestOptions<T, E>): RxStateful<T, E>
  request(source$: Observable<T>, options?: RxStatefulRequestOptions<T, E>): RxStateful<T, E>{
    const mergedConfig = {
      ...this.config,
        ...options
    }

        return rxStateful$<T, E>(source$, mergedConfig);

  }
}
