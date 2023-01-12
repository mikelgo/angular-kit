import {InjectionToken, Type} from '@angular/core';
import {StreamDirectiveContext} from './stream.directive';

export interface StreamDirectiveConfig {
  loadingComponent?: Type<any>;
  errorComponent?: Type<any>;
  completeComponent?: Type<any>;
}

export const STREAM_DIR_CONFIG = new InjectionToken<StreamDirectiveConfig>('STREAM_DIR_CONFIG');

export const STREAM_DIR_CONTEXT = new InjectionToken<StreamDirectiveContext<unknown>>('STREAM_DIR_CONTEXT');
