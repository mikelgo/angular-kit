import { ElementRef } from '@angular/core';

export function mockResizeObserver() {
  window.ResizeObserver = class {
    observe = jest.fn();
    disconnect = jest.fn();
    unobserve = jest.fn();
    constructor(callback: any) {
      callback([{ contentRect: { width: 100, height: 100 } }]);
    }
  };
}

export function createElementRef(): ElementRef {
  return {
    nativeElement: document.createElement('div'),
  };
}
