import {Injectable} from '@angular/core';
import {Config, injectRxStatefulConfig} from '../config/rx-stateful-config.provider';
import {map, Observable} from 'rxjs';
import {RxStateful, RxStatefulConfig, rxStateful$} from '@angular-kit/rx-stateful';


export type RxStatefulRequestOptions<T, E> = RxStatefulConfig<T, E>;

@Injectable({
  providedIn: 'root',
})
export class RxStatefulClient {
  private readonly config = injectRxStatefulConfig();

  request<T, E>(source$: Observable<T>): Observable<RxStateful<T, E>>
  request<T, E, K extends keyof RxStateful<T,E>>(source$: Observable<T>, key: K): Observable<RxStateful<T, E>[K]>;

  request<T, E>(source$: Observable<T>, options: RxStatefulRequestOptions<T, E>): Observable<RxStateful<T, E>>;
  request<T, E, K extends keyof RxStateful<T, E>>(source$: Observable<T>, options: RxStatefulRequestOptions<T, E>, key: K): Observable<RxStateful<T, E>[K]>;

  request<T, E, K extends keyof RxStateful<T, E>>(source$: Observable<T>, optionsOrKey?: RxStatefulRequestOptions<T, E> | K, key?: K):Observable<RxStateful<T, E>> | Observable<RxStateful<T, E>[K]> {

    const strategies = [];
    if (typeof optionsOrKey === 'object') {

      if (optionsOrKey?.refetchStrategies) {
        if (Array.isArray(optionsOrKey.refetchStrategies)) {
          strategies.push(...optionsOrKey.refetchStrategies)
        }
        if (!Array.isArray(optionsOrKey.refetchStrategies)) {
          strategies.push(optionsOrKey.refetchStrategies)
        }
      }
    }

    const refetchstrategies = [
        (this.config?.autoRefetch ?? void 0),
        ...strategies
    ]
    const options = typeof optionsOrKey === 'object' ? optionsOrKey : {};
    const mergedConfig: RxStatefulConfig<T,  E> = {
      ...(this.config as Config<T, E>),
       ...options,
      // @ts-ignore
      refetchStrategies: [...refetchstrategies].filter(Boolean)
    };

    const k = typeof optionsOrKey === 'string' ? optionsOrKey : key;

    if (k){
      return rxStateful$<T, E>(source$, mergedConfig).pipe(
        map(state => state[k])
      );
    }
    return rxStateful$<T, E>(source$, mergedConfig);
  }
}
