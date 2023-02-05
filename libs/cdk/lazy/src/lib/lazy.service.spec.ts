import {TestBed} from '@angular/core/testing';

import {LazyService} from './lazy.service';

describe('LazyService', () => {
  let service: LazyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LazyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
