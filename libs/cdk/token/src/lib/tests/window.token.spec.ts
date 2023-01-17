import {TestBed} from '@angular/core/testing';
import {WINDOW} from '../window.token';
import {PLATFORM_ID} from "@angular/core";

describe('WINDOW', () => {
  it('should create an instance', () => {
    TestBed.configureTestingModule({
      providers: [{provide: PLATFORM_ID, useValue: 'browser'}],
    }).compileComponents();

    const window = TestBed.inject(WINDOW);

    expect(window).toBeTruthy();
  });
});
