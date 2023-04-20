import {ElementRef} from '@angular/core';


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
