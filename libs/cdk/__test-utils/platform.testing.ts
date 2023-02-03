import {ElementRef} from '@angular/core';

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

export function mockMutationObserver() {
  window.MutationObserver = class {
    observe = jest.fn();
    disconnect = jest.fn();
    takeRecords = jest.fn();
    constructor(callback: any) {
      callback([{ target: { clientWidth: 100, clientHeight: 100 } }]);
    }
  };
}
export function mockIntersectionObserver() {
  window.IntersectionObserver = class {
    observe = jest.fn();
    disconnect = jest.fn();
    unobserve = jest.fn();
    rootMargin = '';
    root: Element | null = null;
    thresholds: number[] = [];
    takeRecords() {
      return [];
    }
    constructor(callback: any) {
      callback([{ isIntersecting: true }]);
    }
  };
}

export function createElementRef(): ElementRef {
  return {
    nativeElement: document.createElement('div'),
  };
}
