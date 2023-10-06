import { concatMap, exhaustMap, mergeMap, Observable, Subject, switchMap } from 'rxjs';

type FlatteningStrategy = 'switch' | 'merge' | 'concat' | 'exhaust';

/**
 * Creates an effect from any Observable that emits when a trigger emits.
 *
 * Splitting in effects will heavily untangle reactive-imperative-mixed code where no clear
 * separation of effects and effectTriggers is done.
 *
 * It will also increase heavily testability.
 *
 *
 * @param effectSource - the source observable for the effect
 * @param effectTrigger - the trigger when the effect will run
 *
 * @example
 *  protected readonly openDialog$$ = new Subject<void>()
 *
 *   readonly dialogAfterClosedEffect$ = createEffect(
 *      this.openDialog$$,
 *      () => this.dialog.open(DialogComponent).afterClosed
 *   )
 *
 *   constructor(){
 *       this.dialogAfterClosedEffect$.subscribe()
 *   }
 */
export function createEffect<Tresult, Targ>(
    effectTrigger: Subject<Targ>,
    effectSource: () => Observable<Tresult>
): Observable<Tresult>;
export function createEffect<Tresult, Targ>(
    effectTrigger: Subject<Targ>,
    effectSource: (arg: Targ) => Observable<Tresult>
): Observable<Tresult>;

export function createEffect<Tresult, Targ>(
    effectTrigger: Subject<Targ>,
    effectSource: () => Observable<Tresult>,
    flatteningStrategy: FlatteningStrategy
): Observable<Tresult>;
export function createEffect<Tresult, Targ>(
    effectTrigger: Subject<Targ>,
    effectSource: (arg: Targ) => Observable<Tresult>,
    flatteningStrategy: FlatteningStrategy
): Observable<Tresult>;

export function createEffect<Tresult, Targ>(
    effectTrigger: Subject<Targ>,
    effectSource: (arg?: Targ) => Observable<Tresult>,
    flatteningStrategy?: FlatteningStrategy
): Observable<Tresult> {
    function getFromStrategy(flatteningStrategy: FlatteningStrategy | undefined) {
        switch (flatteningStrategy) {
            case 'switch':
                return switchMap;
            case 'concat':
                return concatMap;
            case 'merge':
                return mergeMap;
            case 'exhaust':
                return exhaustMap;
            default:
                return concatMap;
        }
    }

    const flatteningOperator = getFromStrategy(flatteningStrategy) ?? concatMap;
    return effectTrigger.asObservable().pipe(flatteningOperator((arg: Targ) => effectSource(arg)));
}
