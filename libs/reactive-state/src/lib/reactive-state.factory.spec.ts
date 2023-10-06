import { ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { subscribeSpyTo } from '@hirez_io/observer-spy';
import { BehaviorSubject, map, of } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { ReactiveState } from './reactive-state';
import { Config, reactiveState, SetupFn } from './reactive-state.factory';
import { AccumulationFn } from './utils/create-state-accumulator';

describe('ReactiveState', () => {
    describe('factory function', () => {
        it('should create an instance', async () => {
            const { instance } = await setupComponent();

            expect(instance).toBeDefined();
            expect(instance).toBeInstanceOf(ReactiveState);
        });
        it('should call ngOnDestroy', async () => {
            const { fixture, instance } = await setupComponent();
            jest.spyOn(instance, 'ngOnDestroy');
            fixture.destroy();
            expect(instance.ngOnDestroy).toHaveBeenCalled();
        });

        it('should executed teardown function on destroy', async () => {
            const teardown = jest.fn();
            const { fixture, instance } = await setupComponent({
                setupFn: state => teardown
            });

            fixture.destroy();
            expect(teardown).toHaveBeenCalled();
        });
        it('should allow selecting state in connect', fakeAsync(() => {
            TestBed.configureTestingModule({
                providers: [
                    {
                        provide: ChangeDetectorRef,
                        useValue: {
                            onDestroy: () => {}
                        }
                    }
                ]
            }).runInInjectionContext(() => {
                const b$$ = new BehaviorSubject<number>(0);
                const instance = reactiveState<TestModel>(({ connect, select }) => {
                    connect({
                        b: b$$.asObservable(),
                        a: select('b').pipe(map(v => `${v * 10}`))
                    });
                });

                const result = subscribeSpyTo(instance.state$);
                tick(10);
                b$$.next(1);
                tick(10);
                b$$.next(2);
                tick(10);
                expect(result.getValues()).toEqual([
                    {
                        b: 0,
                        a: undefined
                    },
                    {
                        a: '0',
                        b: 0
                    },
                    {
                        a: '0',
                        b: 1
                    },
                    {
                        a: '10',
                        b: 1
                    },
                    {
                        b: 2,
                        a: '10'
                    },
                    {
                        b: 2,
                        a: '20'
                    }
                ]);
            });
        }));
    });
    describe('initialize', () => {
        it('should set initial state from factory function', async () => {
            const initialState: TestModel = {
                a: 'Hi',
                b: 10
            };
            const { instance } = await setupComponent({
                setupFn: state => state.initialize(initialState)
            });

            const result = subscribeSpyTo(instance.state$);
            expect(result.getValues()).toEqual([initialState]);
        });
        it('should set initial state when calling initialize', async () => {
            const initialState: TestModel = {
                a: 'Hi',
                b: 10
            };
            const { instance } = await setupComponent({
                setupFn: state => state.initialize(initialState)
            });

            instance.initialize(initialState);

            const result = subscribeSpyTo(instance.state$);
            expect(result.getValues()).toEqual([initialState]);
        });
    });
    describe('connect', () => {
        it('should connect using partial of observables', async () => {
            const { instance } = await setupComponent();

            instance.connect({
                a: of('Hi'),
                b: of(42)
            });

            const result = subscribeSpyTo(instance.state$);
            expect(result.getValues()).toEqual([{ a: 'Hi', b: 42 }]);
        });
        it('should connect using a project function', async () => {
            const { instance } = await setupComponent({
                setupFn: state =>
                    state.initialize({
                        b: 42,
                        a: '',
                        c: true
                    })
            });
            const result = subscribeSpyTo(instance.state$);
            instance.connect(oldState => ({ b: oldState.b + 1 }));
            instance.connect(oldState => ({ b: oldState.b + 1 }));

            expect(result.getValues()).toEqual([
                { a: '', b: 42, c: true },
                { a: '', b: 43, c: true },
                { a: '', b: 44, c: true }
            ]);
        });
        it('should connect using a project state function', async () => {
            const { instance } = await setupComponent({
                setupFn: state =>
                    state.initialize({
                        b: 42,
                        a: '',
                        c: true
                    })
            });
            const result = subscribeSpyTo(instance.state$);
            instance.connect<number>(of(10), (s, v) => ({ b: s.b * v }));
            expect(result.getValues()).toEqual([
                { a: '', b: 42, c: true },
                { a: '', b: 420, c: true }
            ]);
        });
        it('should emit only once per emission when multiple partials are connected', async () => {
            const { instance } = await setupComponent();

            const result = subscribeSpyTo(instance.state$);

            instance.connect({
                a: of('Hi'),
                b: of(42),
                c: of(true)
            });

            expect(result.getValues()).toEqual([{ a: 'Hi', b: 42, c: true }]);
        });
    });
    describe('patch', () => {
        it('should patch partial', async () => {
            const { instance } = await setupComponent();

            const result = subscribeSpyTo(instance.state$);

            instance.patch({ c: true });
            instance.patch({ c: false, b: 10 });

            expect(result.getValues()).toEqual([{ c: true }, { c: false, b: 10 }]);
        });
        it('should emit ony distinct changes', async () => {
            const { instance } = await setupComponent();

            const result = subscribeSpyTo(instance.state$);

            instance.patch({ c: true });
            instance.patch({ c: true });
            expect(result.getValues()).toEqual([{ c: true }]);
        });
        it('should patch using project function', async () => {
            const { instance } = await setupComponent({
                setupFn: state => state.initialize({ b: 10, c: true, a: '' })
            });

            const result = subscribeSpyTo(instance.state$);
            instance.patch(oldState => ({ b: oldState.b * 10 }));

            expect(result.getValues()).toEqual([
                { b: 10, c: true, a: '' },
                { b: 100, c: true, a: '' }
            ]);
        });
    });
    describe('snapshot', () => {
        it('should return the current state ', async () => {
            const initialState: TestModel = { b: 10, c: false, a: '' };
            const { instance } = await setupComponent({
                setupFn: state => state.initialize(initialState)
            });

            expect(instance.snapshot()).toEqual(initialState);

            const nextState: TestModel = {
                ...initialState,
                b: 42,
                a: 'Hi'
            };
            instance.patch(nextState);
            expect(instance.snapshot()).toEqual(nextState);
        });
    });
    describe('pick', () => {
        it('should return state partials as observables', async () => {
            const initialState: TestModel = { b: 10, c: false, a: '' };
            const { instance } = await setupComponent({
                setupFn: state => state.initialize(initialState)
            });

            const result = instance.pick(['a', 'b', 'c']);

            const a$ = result.a;
            const b$ = result.b;
            const c$ = result.c;

            // @ts-ignore
            expect(subscribeSpyTo(a$).getValues()).toEqual([initialState.a]);
            // @ts-ignore
            expect(subscribeSpyTo(b$).getValues()).toEqual([initialState.b]);
            // @ts-ignore
            expect(subscribeSpyTo(c$).getValues()).toEqual([initialState.c]);
        });
    });

    describe('select', () => {
        describe('select()', () => {
            it('should be lazy', async () => {
                const { instance } = await setupComponent();

                const result = subscribeSpyTo(instance.select());

                expect(result.getValues()).toEqual([undefined]);
            });
            it('should return the whole state', async () => {
                const initialState: TestModel = { b: 10, c: false, a: '' };
                const { instance } = await setupComponent({
                    setupFn: state => state.initialize(initialState)
                });

                const result = subscribeSpyTo(instance.select());

                expect(result.getValues()).toEqual([initialState]);
            });
        });
        describe('select(mapFn)', () => {
            it('should return the mapped state', async () => {
                const initialState: TestModel = { b: 10, c: false, a: '' };
                const { instance } = await setupComponent({
                    setupFn: state => state.initialize(initialState)
                });

                const result = subscribeSpyTo(instance.select(state => ({ aa: state.a, cc: state.c })));

                expect(result.getValues()).toEqual([{ aa: initialState.a, cc: initialState.c }]);
            });
        });
        describe('select(key)', () => {
            it('should return the state for the selected key', async () => {
                const initialState: TestModel = { b: 10, c: false, a: 'a' };
                const { instance } = await setupComponent({
                    setupFn: state => state.initialize(initialState)
                });

                const result = subscribeSpyTo(instance.select('a'));

                expect(result.getValues()).toEqual([initialState.a]);
            });
        });
        describe('select(keys)', () => {
            it('should return the state for the selected keys', async () => {
                const initialState: TestModel = { b: 10, c: false, a: '' };
                const { instance } = await setupComponent({
                    setupFn: state => state.initialize(initialState)
                });

                const result = subscribeSpyTo(instance.select(['a', 'b']));

                expect(result.getValues()).toEqual([{ a: initialState.a, b: initialState.b }]);
            });
        });
    });
    describe('selectWhenKeysChange', () => {
        it('should emit state only when selected keys change', async () => {
            const initialState: TestModel = { b: 10, c: false, a: '' };
            const { instance } = await setupComponent({
                setupFn: state => state.initialize(initialState)
            });

            const result = subscribeSpyTo(instance.selectWhenKeysChange(['a']));

            instance.patch({ b: 10 });
            instance.patch({ c: true });
            instance.patch({ a: 'hi' });
            instance.patch({ a: 'hi' });

            expect(result.getValues()).toEqual([initialState, { b: 10, c: true, a: 'hi' }]);
        });
    });
    describe('useAccumulatorFn', () => {
        const noopAccumulator: AccumulationFn = (state, slice) => state;
        it('should use custom accumulation function for state updates', async () => {
            const initialState: TestModel = {
                b: 0,
                a: '',
                c: true
            };
            const { instance } = await setupComponent({
                setupFn: state => state.initialize(initialState)
            });

            const result = subscribeSpyTo(instance.state$);
            instance.patch({ b: 10 });
            instance.useAccumulatorFn(noopAccumulator);
            instance.patch({ a: 'will have no effect' });

            expect(result.getValues()).toEqual([initialState, { ...initialState, b: 10 }, { ...initialState, b: 10 }]);
        });
        it('should be possible to use it in setup function', async () => {
            const initialState: TestModel = {
                b: 0,
                a: '',
                c: true
            };
            const { instance } = await setupComponent({
                setupFn: state => {
                    state.useAccumulatorFn(noopAccumulator);
                }
            });

            const result = subscribeSpyTo(instance.state$);
            instance.patch(initialState);
            instance.patch({ b: 10 });

            expect(result.getValues()).toEqual([{}, {}]);
        });
    });
    describe('Connect Inputs', () => {
        describe('connectInputs', () => {
            @Component({
                template: '',
                standalone: true,
                selector: 'devkit-presentational'
            })
            class PresentationalTestComponent implements OnChanges {
                @Input() name: string | null = null;
                @Input() age: number | null = null;

                stateInstance = reactiveState<{ name: string; age: number }>(
                    state => {
                        state.initialize({ name: '', age: 0 });
                    },
                    { connectInputs: this }
                );
                ngOnChanges(changes: SimpleChanges) {
                    const c = changes;
                }
            }

            @Component({
                standalone: true,
                imports: [PresentationalTestComponent, AsyncPipe],
                template: `<devkit-presentational [name]="name$$ | async" [age]="age$$ | async"/>`
            })
            class SmartTestComponent {
                @ViewChild(PresentationalTestComponent, { static: true })
                presentationalComponent!: PresentationalTestComponent;
                name$$ = new BehaviorSubject('Hansi');
                age$$ = new BehaviorSubject(42);
            }

            it('should update state when input changes', async () => {
                await TestBed.configureTestingModule({
                    imports: [PresentationalTestComponent, SmartTestComponent, AsyncPipe]
                }).compileComponents();
                const fixture = TestBed.createComponent(SmartTestComponent);
                const smartTestComponent = fixture.componentInstance;
                const presentationalCompnent = smartTestComponent.presentationalComponent;
                const stateInstance = presentationalCompnent.stateInstance;
                fixture.detectChanges();

                const result = subscribeSpyTo(stateInstance.state$);
                smartTestComponent.name$$.next('Müller');
                smartTestComponent.age$$.next(100);
                fixture.detectChanges();

                expect(result.getValues()).toEqual([
                    { name: '', age: 0 },
                    { name: 'Hansi', age: 42 },
                    { name: 'Müller', age: 100 }
                ]);
            });
        });
    });
});

interface TestModel {
    a: string;
    b: number;
    c?: boolean;
}

async function setupComponent(cfg?: { config?: Config<TestModel>; setupFn?: SetupFn<TestModel> }) {
    @Component({
        template: ''
    })
    class TestComponent {
        @Input() fromInput = 'start';
        stateInstance = cfg ? reactiveState<TestModel>(cfg.setupFn, cfg.config) : reactiveState<TestModel>();
    }

    await TestBed.configureTestingModule({
        declarations: [TestComponent]
    }).compileComponents();

    const fixture = TestBed.createComponent(TestComponent);
    const component = fixture.componentInstance;

    return {
        fixture,
        component,
        instance: component.stateInstance
    };
}
