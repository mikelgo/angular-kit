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

    const mergedConfig = {
      ...(this.config as Config<T, E>),
      ...options,
    };
    if (this.config?.periodicRefetch){
      mergedConfig?.refetchStrategies?.push(this.config?.periodicRefetch);
    }

    return rxStateful$<T, E>(source$, mergedConfig);
  }
}
