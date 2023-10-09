import {Injectable} from '@angular/core';
import {Config, injectRxStatefulConfig} from '../config/rx-stateful-config.provider';
import {Observable} from 'rxjs';
import {RxStateful, RxStatefulConfig} from '../../types/types';
import {rxStateful$} from '../../rx-stateful$';

export type RxStatefulRequestOptions<T, E> = RxStatefulConfig<T, E>;

@Injectable({
  providedIn: 'root',
})
export class RxStatefulClient {
  private readonly config = injectRxStatefulConfig();

  request<T, E>(source$: Observable<T>): RxStateful<T, E>;
  request<T, E>(source$: Observable<T>, options: RxStatefulRequestOptions<T, E>): RxStateful<T, E>;
  request<T, E>(source$: Observable<T>, options?: RxStatefulRequestOptions<T, E>): RxStateful<T, E> {

    const strategies = [];

    if (options?.refetchStrategies){
      if (Array.isArray(options.refetchStrategies)){
        strategies.push(...options.refetchStrategies)
      }
      if (!Array.isArray(options.refetchStrategies)){
        strategies.push(options.refetchStrategies)
      }
    }

    const refetchstrategies = [
        (this.config?.autoRefetch ?? void 0),
        ...strategies
    ]

    const mergedConfig: RxStatefulConfig<T,  E> = {
      ...(this.config as Config<T, E>),
      ...options,
      // @ts-ignore
      refetchStrategies: [...refetchstrategies].filter(Boolean)
    };


    return rxStateful$<T, E>(source$, mergedConfig);
  }
}
