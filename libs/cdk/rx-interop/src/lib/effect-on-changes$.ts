import {SimpleChanges} from '@angular/core';
import {mapChanges} from "./util/map-changes";

// eslint-disable-next-line
export interface TypedSimpleChanges<I> extends SimpleChanges {}

export type OnChangesEffect<I> = (changes: Partial<I>) => void;

export interface EffectOnChangesConfig{
  allowUndefined?: boolean;
  allowNull?: boolean;
}

export function effectOnChanges$<I extends Record<string, any>>(changes: TypedSimpleChanges<I>, cb: OnChangesEffect<I>): void;
export function effectOnChanges$<I extends Record<string, any>, K extends keyof I>(changes: TypedSimpleChanges<I>, key: K, cb: OnChangesEffect<I>): void;
export function effectOnChanges$<I extends Record<string, any>>(changes: TypedSimpleChanges<I>, keyOrCb: string | OnChangesEffect<I>, cb?: OnChangesEffect<I>): void {
  const mappedChanges: Partial<I> = mapChanges(changes);
  if (mappedChanges === undefined) {
    return;
  }
  if (typeof keyOrCb === 'string') {
    // @ts-ignore
    const value = mappedChanges[keyOrCb];
    if(value === undefined){
      return;
    }
    // @ts-ignore
    cb(value);
  } else {
    keyOrCb(mappedChanges);
  }
}

