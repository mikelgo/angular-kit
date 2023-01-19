import {ElementRef} from "@angular/core";

export function isElementRef(value: unknown): value is ElementRef {
  return value instanceof ElementRef;
}
