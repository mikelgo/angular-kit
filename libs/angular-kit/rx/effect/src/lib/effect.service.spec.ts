import { TestBed } from '@angular/core/testing';
import { Effect } from './effect.service';

describe(Effect.name, () => {
  let service: Effect;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Effect],
    });
    service = TestBed.inject(Effect);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
