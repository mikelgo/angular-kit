import {SimpleChanges} from '@angular/core';
import {mapChanges} from "./util/map-changes";

// eslint-disable-next-line
export interface TypedSimpleChanges<I> extends SimpleChanges {}

export type OnChangesEffect<I> = (changes: Partial<I>) => void;

export function effectOnChanges$<I>(changes: TypedSimpleChanges<I>, cb: OnChangesEffect<I>): void;
export function effectOnChanges$<I, K extends keyof I>(changes: TypedSimpleChanges<I>, key: K, cb: OnChangesEffect<I>): void;
export function effectOnChanges$<I>(changes: TypedSimpleChanges<I>, keyOrCb: string | OnChangesEffect<I>, cb?: OnChangesEffect<I>): void {
  if (typeof keyOrCb === 'string') {
    cb(mapChanges(changes)[keyOrCb]);
  } else {
    keyOrCb(mapChanges(changes));
  }
}

