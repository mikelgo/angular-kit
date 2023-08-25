import {Component, inject, ViewChild} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {subscribeSpyTo} from '@hirez_io/observer-spy';
import {RxHooks$} from './rx-hooks.directive';

describe('RxHooks$', () => {
  it('should create an instance', () => {
    const directive = new RxHooks$();
    expect(directive).toBeTruthy();
  });

  describe('On host component', () => {
    it('should emit onCreation$ when HostComponent is created', async () => {
      const { component } = await setupHostComponent();

      const result = subscribeSpyTo(component.hooks$.onCreation$);
      expect(result.getLastValue()).toEqual(void 0);
    });

    it('should emit onInit$ when HostComponent ngOnInit is called', async () => {
      const { component } = await setupHostComponent();

      const result = subscribeSpyTo(component.hooks$.onInit$);
      expect(result.getLastValue()).toEqual(void 0);
    });

    it('should emit doCheck$ when HostComponent ngDoCheck is called', async () => {
      const { component } = await setupHostComponent();

      const result = subscribeSpyTo(component.hooks$.doCheck$);
      expect(result.getLastValue()).toEqual(void 0);
    });

    it('should emit afterContentInit$ when HostComponent ngAfterContentInit is called', async () => {
      const { component } = await setupHostComponent();

      const result = subscribeSpyTo(component.hooks$.afterContentInit$);
      expect(result.getLastValue()).toEqual(void 0);
    });

    it('should emit afterContentChecked$ when HostComponent ngAfterContentChecked is called', async () => {
      const { component } = await setupHostComponent();

      const result = subscribeSpyTo(component.hooks$.afterContentChecked$);
      expect(result.getLastValue()).toEqual(void 0);
    });

    it('should emit afterViewInit$ when HostComponent ngAfterViewInit is called', async () => {
      const { component } = await setupHostComponent();

      const result = subscribeSpyTo(component.hooks$.afterViewInit$);
      expect(result.getLastValue()).toEqual(void 0);
    });
    it('should emit afterViewChecked$ when HostComponent ngAfterViewChecked is called', async () => {
      const { component } = await setupHostComponent();

      const result = subscribeSpyTo(component.hooks$.afterViewChecked$);
      expect(result.getLastValue()).toEqual(void 0);
    });

    it('should emit onDestroy$ when HostComponent ngOnDestroy is called', async () => {
      const { component } = await setupHostComponent();

      const result = subscribeSpyTo(component.hooks$.onDestroy$);
      expect(result.getLastValue()).toEqual(void 0);
    });
  });

  describe('On host element', () => {
    it('should emit onCreation$ when HostComponent is created', async () => {
      const { component } = await setupOnHostElement();

      const result = subscribeSpyTo(component.hooks$.onCreation$);
      expect(result.getLastValue()).toEqual(void 0);
    });

    it('should emit onInit$ when HostComponent ngOnInit is called', async () => {
      const { component } = await setupOnHostElement();

      const result = subscribeSpyTo(component.hooks$.onInit$);
      expect(result.getLastValue()).toEqual(void 0);
    });

    it('should emit doCheck$ when HostComponent ngDoCheck is called', async () => {
      const { component } = await setupOnHostElement();

      const result = subscribeSpyTo(component.hooks$.doCheck$);
      expect(result.getLastValue()).toEqual(void 0);
    });

    it('should emit afterContentInit$ when HostComponent ngAfterContentInit is called', async () => {
      const { component } = await setupOnHostElement();

      const result = subscribeSpyTo(component.hooks$.afterContentInit$);
      expect(result.getLastValue()).toEqual(void 0);
    });

    it('should emit afterContentChecked$ when HostComponent ngAfterContentChecked is called', async () => {
      const { component } = await setupOnHostElement();

      const result = subscribeSpyTo(component.hooks$.afterContentChecked$);
      expect(result.getLastValue()).toEqual(void 0);
    });

    it('should emit afterViewInit$ when HostComponent ngAfterViewInit is called', async () => {
      const { component } = await setupOnHostElement();

      const result = subscribeSpyTo(component.hooks$.afterViewInit$);
      expect(result.getLastValue()).toEqual(void 0);
    });
    it('should emit afterViewChecked$ when HostComponent ngAfterViewChecked is called', async () => {
      const { component } = await setupOnHostElement();

      const result = subscribeSpyTo(component.hooks$.afterViewChecked$);
      expect(result.getLastValue()).toEqual(void 0);
    });

    it('should emit onDestroy$ when HostComponent ngOnDestroy is called', async () => {
      const { component } = await setupOnHostElement();

      const result = subscribeSpyTo(component.hooks$.onDestroy$);
      expect(result.getLastValue()).toEqual(void 0);
    });
  });
});

async function setupHostComponent() {
  @Component({
    selector: 'devkit-test-host',
    template: '',
    hostDirectives: [RxHooks$],
    standalone: true
  })
  class TestComponent {
    hooks$ = inject(RxHooks$);
  }

  await TestBed.configureTestingModule({
    imports: [TestComponent, RxHooks$]
  }).compileComponents();

  const fixture = TestBed.createComponent(TestComponent);
  const component = fixture.componentInstance;

  return { fixture, component };
}

async function setupOnHostElement() {
  @Component({
    selector: 'devkit-test-host',
    template: ` <div rxHooks></div> `,
    imports: [RxHooks$],
    standalone: true
  })
  class TestComponent {
    @ViewChild(RxHooks$, { static: true })
    hooks$!: RxHooks$;
  }

  await TestBed.configureTestingModule({
    imports: [TestComponent, RxHooks$]
  }).compileComponents();

  const fixture = TestBed.createComponent(TestComponent);
  const component = fixture.componentInstance;

  return { fixture, component };
}
