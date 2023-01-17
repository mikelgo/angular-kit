import {TestBed} from '@angular/core/testing';
import {WINDOW} from '../window.token';
import {NAVIGATOR} from '../navigator.token';

describe('NAVIGATOR', () => {
  it('should create an instance', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: WINDOW, useValue: window }],
    }).compileComponents();

    const navigator = TestBed.inject(NAVIGATOR);

    expect(navigator).toBeTruthy();
  });
});
