import {TestBed} from '@angular/core/testing';
import {EffectService} from './effect.service';

describe(EffectService.name, () => {
  let service: EffectService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EffectService],
    });
    service = TestBed.inject(EffectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
