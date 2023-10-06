// eslint-disable-next-line @nx/enforce-module-boundaries

import { isObservable } from "rxjs";
import { Component, ErrorHandler } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { mockConsole } from "../../test-utils/mock-console";
import { ReactiveActionFactory } from "./actions.factory";

// tslint:disable-next-line: prefer-on-push-component-change-detection  use-component-selector
@Component({
    template: '',
    providers: [ReactiveActionFactory]
})
class TestComponent {
    ui = this.actions.create({
        search: (e: InputEvent | string): string => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return typeof e === 'object' ? (e as any).target.value : e;
        },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        resize: (_: string | number): number => {
            throw new Error('something went wrong');
        }
    });
    constructor(private readonly actions: ReactiveActionFactory<{ search: string; resize: number }>) {}
}

/** @test {RxActionFactory} */
describe('RxActionFactory', () => {
    beforeAll(() => mockConsole());

    it('should get created properly', () => {
        const actions = new ReactiveActionFactory<{ prop: string }>(null).create();
        expect(typeof actions.prop).toBe('function');
        expect(isObservable(actions.prop)).toBeFalsy();
        expect(isObservable(actions.prop$)).toBeTruthy();
    });

    it('should emit on the subscribed channels', done => {
        const values = 'foo';
        const actions = new ReactiveActionFactory<{ prop: string }>(null).create();
        const exp = values;
        actions.prop$.subscribe(result => {
            expect(result).toBe(exp);
            done();
        });
        actions.prop(values);
    });

    it('should maintain channels per create call', done => {
        const values = 'foo';
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const nextSpy = jest.spyOn({ nextSpy: (_: string) => void 0 }, 'nextSpy');
        const actions = new ReactiveActionFactory<{ prop: string }>(null).create();
        const actions2 = new ReactiveActionFactory<{ prop: string }>(null).create();
        const exp = values;

        actions2.prop$.subscribe(nextSpy as unknown as (_: string) => void);
        actions.prop$.subscribe(result => {
            expect(result).toBe(exp);
            done();
        });
        expect(nextSpy).not.toHaveBeenCalled();
        actions.prop(values);
    });

    it('should emit and transform on the subscribed channels', done => {
        const actions = new ReactiveActionFactory<{ prop: string }>(null).create({
            prop: () => 'transformed'
        });
        const exp = 'transformed';
        actions.prop$.subscribe(result => {
            expect(result).toBe(exp);
            done();
        });
        actions.prop();
    });

    it('should emit on multiple subscribed channels', done => {
        const value1 = 'foo';
        const value2 = 'bar';

        const actions = new ReactiveActionFactory<{
            prop1: string;
            prop2: string;
        }>(null).create();
        const res = {};
        actions.prop1$.subscribe((result: any) => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            res['prop1'] = result;
        });
        actions.prop2$.subscribe((result: any) => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            res['prop2'] = result;
        });
        actions({ prop1: value1, prop2: value2 });
        expect(res).toStrictEqual({ prop1: value1, prop2: value2 });
        done();
    });

    it('should emit on multiple subscribed channels over mreged output', done => {
        const value1 = 'foo';
        const value2 = 'bar';
        const actions = new ReactiveActionFactory<{
            prop1: string;
            prop2: string;
        }>(null).create();

        const res: Array<any> = [];
        expect(typeof actions.$).toBe('function');
        actions.$(['prop1', 'prop2']).subscribe(result => {
            res.push(result);
        });
        actions({ prop1: value1, prop2: value2 });
        expect(res.length).toBe(2);
        expect(res).toStrictEqual([value1, value2]);
        done();
    });

    it('should destroy all created actions', done => {
        let numCalls = 0;
        let numCalls2 = 0;
        const factory = new ReactiveActionFactory<{ prop: void }>(null);
        const actions = factory.create();
        const actions2 = factory.create();

        actions.prop$.subscribe(() => ++numCalls);
        actions2.prop$.subscribe(() => ++numCalls2);
        expect(numCalls).toBe(0);
        expect(numCalls2).toBe(0);
        actions.prop();
        actions2.prop();
        expect(numCalls).toBe(1);
        expect(numCalls2).toBe(1);
        factory.destroy();
        actions.prop();
        actions2.prop();
        expect(numCalls).toBe(1);
        expect(numCalls2).toBe(1);
        done();
    });

    it('should throw if a setter is used', done => {
        const factory = new ReactiveActionFactory<{ prop: number }>(null);
        const actions = factory.create();

        expect(() => {
            (actions as any).prop = 0;
        }).toThrow('');

        done();
    });

    test('should isolate errors and invoke provided ', async () => {
        const custom: ErrorHandler = {
            handleError: jest.fn()
        };
        await TestBed.configureTestingModule({
            declarations: [TestComponent],
            providers: [
                {
                    provide: ErrorHandler,
                    useValue: custom
                }
            ]
        }).compileComponents();
        const fixture = TestBed.createComponent(TestComponent);

        fixture.componentInstance.ui.search('');
        fixture.componentInstance.ui.resize(42);

        expect(custom.handleError).toHaveBeenCalledWith(new Error('something went wrong'));
    });
});
