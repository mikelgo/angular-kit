import { Component, inject, OnDestroy } from '@angular/core';
import { interval, of, Subject } from 'rxjs';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Effects, effects } from './effects';

describe(effects.name, () => {
  describe('factory function', () => {
    it('should execute all effects', async () => {
      const { service, component } = await setup();

      component.trigger$$.next(10);
      component.trigger$$.next(20);

      expect(service.sourceEffect).toHaveBeenCalledWith(10);
      expect(service.triggerEffect).toBeCalledTimes(2);
      expect(service.triggerEffect).toHaveBeenNthCalledWith(1, 10);
      expect(service.triggerEffect).toHaveBeenNthCalledWith(2, 20);
    });
    it('should unsubscribe from sources onDestroy', async () => {
      const { service, component, fixture } = await setup();

      fixture.destroy();
      component.trigger$$.next(10);

      expect(service.triggerEffect).not.toHaveBeenCalled();
    });
    it('should execute teardown function onDestroy', async () => {
      const { component, fixture } = await setup();
      jest.spyOn(component.clearInterval$$, 'next');
      fixture.destroy();

      expect(component.clearInterval$$.next).toHaveBeenCalled();
    });

    describe('cleanUp', () => {
      it('should execute teardown function when terminate is called', async () => {
        const { component } = await setup();
        jest.spyOn(component.clearInterval$$, 'next');
        component.effects.cleanUp();

        expect(component.clearInterval$$.next).toHaveBeenCalled();
      });
      it('should unsubscribe from all sources when terminate is called', async () => {
        const { service, component } = await setup();

        component.effects.cleanUp();
        component.trigger$$.next(10);

        expect(service.triggerEffect).not.toHaveBeenCalled();
      });
    });

    describe('runOnInstanceDestroy', () => {
      it('should execute effect onDestroy', async () => {
        const { service, fixture } = await setup();
        fixture.destroy();

        expect(service.teardownEffect).toHaveBeenCalled();
      });
    });
    describe('cleanUp', () => {
      it('should unsubscribe trigger$$ when unsubscribeTrigger$$ emits', async () => {
        const { component, service } = await setup();

        component.trigger$$.next(10);
        component.unsubscribeTrigger$$.next(void 0);
        component.trigger$$.next(20);

        expect(service.triggerEffect).toBeCalledTimes(1);
        expect(service.triggerEffect).toHaveBeenCalledWith(10);
      });
    });
  });

  describe('Single Instance created', () => {
    const serviceMock = {
      sourceEffect: jest.fn(),
      triggerEffect: jest.fn(),
      teardownEffect: jest.fn(),
    };
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        providers: [{ provide: Service, useValue: serviceMock }],
      }).compileComponents();
    });
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });
    it('should create instance of Effects', () => {
      TestBed.runInInjectionContext(() => {
        const eff = effects();
        expect(eff).toBeInstanceOf(Effects);
      });
    });
    it('should unsubscribe from single effect when calling cleanUp', fakeAsync(() => {
      TestBed.runInInjectionContext(() => {
        const service = TestBed.inject(Service);
        const trigger$$ = new Subject<number>();
        const eff = effects();
        const effect1 = eff.run(trigger$$, (v) => service.triggerEffect(v));
        const effect2 = eff.run(interval(10), (v) => service.sourceEffect(v));

        trigger$$.next(10);
        tick(10);
        effect2.cleanUp();

        tick(20);
        trigger$$.next(20);
        effect1.cleanUp();

        trigger$$.next(30);

        expect(service.triggerEffect).toBeCalledTimes(2);
        expect(service.triggerEffect).toHaveBeenNthCalledWith(1, 10);
        expect(service.triggerEffect).toHaveBeenNthCalledWith(2, 20);

        expect(service.sourceEffect).toBeCalledTimes(1);
        expect(service.sourceEffect).toHaveBeenNthCalledWith(1, 0);
      });
    }));
  });
});

async function setup() {
  const serviceMock = {
    sourceEffect: jest.fn(),
    triggerEffect: jest.fn(),
    teardownEffect: jest.fn(),
  };
  await TestBed.configureTestingModule({
    providers: [{ provide: Service, useValue: serviceMock }],
    declarations: [TestComponent],
  }).compileComponents();

  jest.restoreAllMocks();
  jest.clearAllMocks();

  const fixture = TestBed.createComponent(TestComponent);
  const component = fixture.componentInstance;
  const service = TestBed.inject(Service);

  return {
    component,
    fixture,
    service,
  };
}

class Service {
  sourceEffect(v: number) {
    return v;
  }
  triggerEffect(v: number) {
    return v;
  }
  teardownEffect() {}
}

@Component({
  template: '',
})
class TestComponent implements OnDestroy {
  service = inject(Service);
  trigger$$ = new Subject<number>();
  unsubscribeTrigger$$ = new Subject();

  destroy$$ = new Subject();
  source$ = of(10);
  clearInterval$$ = new Subject();

  effects = effects(({ run, runOnInstanceDestroy }) => {
    run(this.source$, (v) => this.service.sourceEffect(v));
    const triggerEffect = run(this.trigger$$, (v) => this.service.triggerEffect(v));

    run(this.unsubscribeTrigger$$, () => {
      triggerEffect.cleanUp();
    });

    runOnInstanceDestroy(() => {
      this.service.teardownEffect();
      this.clearInterval$$.next(void 0);
    });
  });

  ngOnDestroy() {
    this.destroy$$.next(void 0);
    this.clearInterval$$.next(void 0);
  }
}
