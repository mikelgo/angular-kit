import {inject, InjectionToken, Provider, Type} from '@angular/core';
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

const STREAM_DIR_CONFIG = new InjectionToken<StreamDirectiveConfig>('STREAM_DIR_CONFIG');

export const STREAM_DIR_CONTEXT = new InjectionToken<StreamDirectiveContext>('STREAM_DIR_CONTEXT');


export function provideStreamDirectiveConfig(config: StreamDirectiveConfig): Provider {
  return {provide: STREAM_DIR_CONFIG, useValue: config};
}

export function provideStreamDirectiveContext<T>(context: StreamDirectiveContext<T>): Provider {
  return {provide: STREAM_DIR_CONTEXT, useValue: context};
}

export function injectStreamDirectiveConfig(): StreamDirectiveConfig | null{
  return inject(STREAM_DIR_CONFIG, {optional: true});
}

export function injectStreamDirectiveContext(): StreamDirectiveContext {
  return inject(STREAM_DIR_CONTEXT);
}
