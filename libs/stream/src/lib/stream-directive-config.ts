import {InjectionToken, Type} from '@angular/core';
import {StreamDirectiveContext} from './types/stream-directive-context';
import {RenderStrategies} from "./types/render-strategies";

export interface StreamDirectiveConfig {
  loadingComponent?: Type<any>;
  errorComponent?: Type<any>;
  completeComponent?: Type<any>;
  keepValueOnLoading?: boolean;
  lazyViewCreation?: boolean;
  renderStrategy?: RenderStrategies;
}

export const STREAM_DIR_CONFIG = new InjectionToken<StreamDirectiveConfig>('STREAM_DIR_CONFIG');

export const STREAM_DIR_CONTEXT = new InjectionToken<StreamDirectiveContext<unknown>>('STREAM_DIR_CONTEXT');
