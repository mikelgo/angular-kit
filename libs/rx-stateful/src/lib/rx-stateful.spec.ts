import { rxStateful$ } from './rx-stateful$';
import { TestScheduler, RunHelpers } from 'rxjs/testing';
import {mergeAll, of, Subject, throwError} from 'rxjs';
import { RxStateful, RxStatefulConfig } from './types/types';
import { withRefetchOnTrigger } from './refetch-strategies/refetch-on-trigger.strategy';
import {subscribeSpyTo} from "@hirez_io/observer-spy";

describe(rxStateful$.name, () => {
  describe('non-flicker suspense not used', () => {
    const defaultConfig: RxStatefulConfig<any> = {
      suspenseTimeMs: 0,
      suspenseThresholdMs: 0,
      keepValueOnRefresh: false,
      keepErrorOnRefresh: false,
    };
    describe('Observable Signature', () => {
      it('should not emit a suspense = true state for sync observable', () => {
        runWithTestScheduler(({ expectObservable }) => {
          const source$ = rxStateful$(of(1), defaultConfig);

          const expected = 's';

          expectObservable(source$).toBe(
            expected,
            marbelize({
              s: {
                hasError: false,
                error: undefined,
                context: 'next',
                value: 1,
                hasValue: true,
                isSuspense: false,
              },
            })
          );
        });
      });
      // TODO
      // it('underlying source$ should be multicasted', () => {
      //
      // });
      describe('Using refreshTrigger', () => {
        it('should emit the correct state when using a refreshTrigger ', () => {
          runWithTestScheduler(({ expectObservable, cold }) => {
            const s$ = cold('-a|', { a: 1 });
            const refresh$ = cold('---a-', { a: void 0 });
            const expected = 'sa-sb-';
            const source$ = rxStateful$(s$, { ...defaultConfig, refetchStrategies: [withRefetchOnTrigger(refresh$)] });

            expectObservable(source$).toBe(
              expected,
              marbelize({
                s: {
                  hasError: false,
                  error: undefined,
                  context: 'suspense',
                  value: null,
                  hasValue: false,
                  isSuspense: true,
                },
                a: {
                  hasError: false,
                  error: undefined,
                  context: 'next',
                  value: 1,
                  hasValue: true,
                  isSuspense: false,
                },
                b: {
                  hasError: false,
                  error: undefined,
                  context: 'next',
                  value: 1,
                  hasValue: true,
                  isSuspense: false,
                },
              })
            );
          });
        });
        it('should keep the value on refresh when keepValueOnRefresh = true', () => {
          runWithTestScheduler(({ expectObservable, cold }) => {
            const s$ = cold('-a|', { a: 1 });
            const refresh$ = cold('---a-', { a: void 0 });
            const expected = 'za-yb-';
            const source$ = rxStateful$(s$, {
              ...defaultConfig,
              keepValueOnRefresh: true,
              refetchStrategies: [withRefetchOnTrigger(refresh$)],
            });

            expectObservable(source$).toBe(
              expected,
              marbelize({
                z: {
                  hasError: false,
                  error: undefined,
                  context: 'suspense',
                  // TODO in this case why is value not null initially?
                  // value: null,
                  hasValue: false,
                  isSuspense: true,
                },
                y: {
                  hasError: false,
                  error: undefined,
                  context: 'suspense',
                  value: 1,
                  hasValue: true,
                  isSuspense: true,
                },
                a: {
                  hasError: false,
                  error: undefined,
                  context: 'next',
                  value: 1,
                  hasValue: true,
                  isSuspense: false,
                },
                b: {
                  hasError: false,
                  error: undefined,
                  context: 'next',
                  value: 1,
                  hasValue: true,
                  isSuspense: false,
                },
              })
            );
          });
        });
      });
    });

    describe('Callback Signature', () => {
      it('should not emit a suspense = true state for sync observables', () => {
        runWithTestScheduler(({ expectObservable, cold }) => {
          const trigger = cold('a--b', { a: 1, b: 2 });
          const source$ = rxStateful$((n) => of(n), {
            ...defaultConfig,
            sourceTriggerConfig: {
              trigger,
            },
          });

          const expected = 'a--b';

          expectObservable(source$).toBe(
            expected,
            marbelize({
              a: {
                hasError: false,
                error: undefined,
                context: 'next',
                value: 1,
                hasValue: true,
                isSuspense: false,
              },
              b: {
                hasError: false,
                error: undefined,
                context: 'next',
                value: 2,
                hasValue: true,
                isSuspense: false,
              },
            })
          );
        });
      });
      // TODO
      // it('underlying source$ should be multicasted', () => {
      //
      // });
      it('should emit correct state when sourceTrigger emits and when a refetch is happening', () => {
        runWithTestScheduler(({ expectObservable, cold }) => {
          /**
           * trigger    -a-----b-
           * refresh    ---a-----
           * expected   -sasa--sb
           *
           * s$         -a            (takes 1 frame and then emit value)
           */
          const trigger = cold('-a-----b-', { a: 1, b: 2 });
          const refresh = cold('---a-', { a: void 0 });
          const s$ = (n: number) => cold('-a', { a: n });
          const expected = '-sasa--sb';

          const source$ = rxStateful$((n) => s$(n), {
            ...defaultConfig,
            refetchStrategies: [withRefetchOnTrigger(refresh)],
            sourceTriggerConfig: {
              trigger,
            },
          });

          expectObservable(source$).toBe(
            expected,
            marbelize({
              s: {
                hasError: false,
                error: undefined,
                context: 'suspense',
                value: null,
                hasValue: false,
                isSuspense: true,
              },
              a: {
                hasError: false,
                error: undefined,
                context: 'next',
                value: 1,
                hasValue: true,
                isSuspense: false,
              },
              b: {
                hasError: false,
                error: undefined,
                context: 'next',
                value: 2,
                hasValue: true,
                isSuspense: false,
              },
            })
          );
        });
      });
      it('should keep the value on refresh when keepValueOnRefresh = true', () => {
        runWithTestScheduler(({ expectObservable, cold }) => {
          /**
           * trigger    -a-----b-
           * refresh    ---a-----
           * expected   -sasa--sb
           *
           * s$         -a            (takes 1 frame and then emit value)
           */
          const trigger = cold('-a-----b-', { a: 1, b: 2 });
          const refresh = cold('---a-', { a: void 0 });
          const s$ = (n: number) => cold('-a', { a: n });
          const expected = '-zaxa--xb';

          const source$ = rxStateful$((n) => s$(n), {
            ...defaultConfig,
            keepValueOnRefresh: true,
            refetchStrategies: [withRefetchOnTrigger(refresh)],
            sourceTriggerConfig: {
              trigger,
            },
          });

          expectObservable(source$).toBe(
            expected,
            marbelize({
              z: {
                hasError: false,
                error: undefined,
                context: 'suspense',
                // value: null,
                hasValue: false,
                isSuspense: true,
              },
              x: {
                hasError: false,
                error: undefined,
                context: 'suspense',
                value: 1,
                hasValue: true,
                isSuspense: true,
              },
              a: {
                hasError: false,
                error: undefined,
                context: 'next',
                value: 1,
                hasValue: true,
                isSuspense: false,
              },
              b: {
                hasError: false,
                error: undefined,
                context: 'next',
                value: 2,
                hasValue: true,
                isSuspense: false,
              },
            })
          );
        });
      });
    });

    describe('Error Handling', () => {
      describe('Observable Signature', () => {
        describe('When error happens', () => {
          it('should handle error and operate correctly afterwards', () => {
            runWithTestScheduler(({ expectObservable, cold }) => {
              const error = new Error('oops');
              const s$ = cold('-#', {}, error);
              const refresh$ = cold('---a-', { a: void 0 });
              const expected = 'sa-sa-';
              const source$ = rxStateful$(s$, {
                ...defaultConfig,
                refetchStrategies: [withRefetchOnTrigger(refresh$)],
              });

              expectObservable(source$).toBe(
                expected,
                marbelize({
                  s: {
                    hasError: false,
                    error: undefined,
                    context: 'suspense',
                    value: null,
                    hasValue: false,
                    isSuspense: true,
                  },
                  a: {
                    hasError: true,
                    error: error,
                    context: 'error',
                    value: null,
                    hasValue: false,
                    isSuspense: false,
                  },
                })
              );
            });
          });
          it('should keep the error on refresh when keepErrorOnRefresh = true', () => {
            runWithTestScheduler(({ expectObservable, cold }) => {
              const error = new Error('oops');
              const s$ = cold('-#', {}, error);
              const refresh$ = cold('---a-', { a: void 0 });
              const expected = 'za-ya-';
              const source$ = rxStateful$(s$, {
                ...defaultConfig,
                keepErrorOnRefresh: true,
                refetchStrategies: [withRefetchOnTrigger(refresh$)],
              });

              expectObservable(source$).toBe(
                expected,
                marbelize({
                  z: {
                    hasError: false,
                    error: undefined,
                    context: 'suspense',
                    value: null,
                    hasValue: false,
                    isSuspense: true,
                  },
                  y: {
                    hasError: true,
                    error: error,
                    context: 'suspense',
                    value: null,
                    hasValue: false,
                    isSuspense: true,
                  },
                  a: {
                    hasError: true,
                    error: error,
                    context: 'error',
                    value: null,
                    hasValue: false,
                    isSuspense: false,
                  },
                })
              );
            });
          });
          it('should execute beforeHandleErrorFn', () => {
            const source$ = new Subject<any>();
            const beforeHandleErrorFn = jest.fn();
            const result = subscribeSpyTo(
              rxStateful$<any>(source$.pipe(mergeAll()), { ...defaultConfig, beforeHandleErrorFn })
            );

            source$.next(throwError(() => new Error('error')));

            expect(beforeHandleErrorFn).toHaveBeenCalledWith(Error('error'));
            expect(beforeHandleErrorFn).toBeCalledTimes(1);
          });
          it('should use errorMappingFn', () => {
            runWithTestScheduler(({ expectObservable, cold }) => {
              const error = new Error('oops');
              const s$ = cold('-#', {}, error);
              const refresh$ = cold('---a-', { a: void 0 });
              const expected = 'sa-sa-';
              const source$ = rxStateful$<any,any>(s$, {
                ...defaultConfig,
                errorMappingFn: (error: Error) => error.message,
                refetchStrategies: [withRefetchOnTrigger(refresh$)],
              });

              expectObservable(source$).toBe(
                expected,
                marbelize({
                  s: {
                    hasError: false,
                    error: undefined,
                    context: 'suspense',
                    value: null,
                    hasValue: false,
                    isSuspense: true,
                  },
                  a: {
                    hasError: true,
                    error: error.message,
                    context: 'error',
                    value: null,
                    hasValue: false,
                    isSuspense: false,
                  },
                })
              );
            });
          });
        });
      });
      describe('Callback Signature', () => {
        describe('When error happens', () => {
          it('should handle error and operate correctly afterwards', () => {
            runWithTestScheduler(({ expectObservable, cold }) => {
              const error = new Error('oops');
              const s$ = cold('-#', {}, error);
              const trigger$ = cold('a---a-', { a: 1 });
              const expected = 'sa--sa-';
              const source$ = rxStateful$<any, any>((n: number) => s$, {
                ...defaultConfig,
              sourceTriggerConfig: {
                  trigger: trigger$
              }});

              expectObservable(source$).toBe(
                expected,
                marbelize({
                  s: {
                    hasError: false,
                    error: undefined,
                    context: 'suspense',
                    value: null,
                    hasValue: false,
                    isSuspense: true,
                  },
                  a: {
                    hasError: true,
                    error: error,
                    context: 'error',
                    value: null,
                    hasValue: false,
                    isSuspense: false,
                  },
                })
              );
            });
          });
          it('should keep the error on refresh when keepErrorOnRefresh = true', () => {
            runWithTestScheduler(({ expectObservable, cold }) => {
              const error = new Error('oops');
              const s$ = cold('-#', {}, error);
              const trigger$ = cold('a---a-', { a: 1 });
              const expected = 'za--ya-';
              const source$ = rxStateful$<any, any>((n: number) => s$, {
                ...defaultConfig,
                keepErrorOnRefresh: true,
                sourceTriggerConfig: {
                  trigger: trigger$
                }});

              expectObservable(source$).toBe(
                expected,
                marbelize({
                  z: {
                    hasError: false,
                    error: undefined,
                    context: 'suspense',
                    value: null,
                    hasValue: false,
                    isSuspense: true,
                  },
                  y: {
                    hasError: true,
                    error: error,
                    context: 'suspense',
                    value: null,
                    hasValue: false,
                    isSuspense: true,
                  },
                  a: {
                    hasError: true,
                    error: error,
                    context: 'error',
                    value: null,
                    hasValue: false,
                    isSuspense: false,
                  },
                })
              );
            });
          });
          it('should execute beforeHandleErrorFn', () => {
            const trigger$ = new Subject<any>()
            const beforeHandleErrorFn = jest.fn();
            const result = subscribeSpyTo(
              rxStateful$<any, any>(() => throwError(() => new Error('error')), { ...defaultConfig, beforeHandleErrorFn, sourceTriggerConfig: {
                trigger: trigger$
                } })
            );

            trigger$.next(null)

            expect(beforeHandleErrorFn).toHaveBeenCalledWith(Error('error'));
            // TODO this needs investigation
            expect(beforeHandleErrorFn).toBeCalledTimes(2);
          });
          it('should use errorMappingFn', () => {
            runWithTestScheduler(({ expectObservable, cold }) => {
              const error = new Error('oops');
              const s$ = cold('-#', {}, error);
              const trigger$ = cold('a---a-', { a: 1 });
              const expected = 'sa--sa-';
              // @ts-ignore
              const source$ = rxStateful$<any, any>((n: number) => s$, {
                ...defaultConfig,
                errorMappingFn: (error: Error) => error.message,
                sourceTriggerConfig: {
                  trigger: trigger$
                }});

              expectObservable(source$).toBe(
                expected,
                marbelize({
                  s: {
                    hasError: false,
                    error: undefined,
                    context: 'suspense',
                    value: null,
                    hasValue: false,
                    isSuspense: true,
                  },
                  a: {
                    hasError: true,
                    error: error.message,
                    context: 'error',
                    value: null,
                    hasValue: false,
                    isSuspense: false,
                  },
                })
              );
            });
          });
        });
      });
    });
  });
  describe('using non-flicker suspense', () => {
    const defaultConfig: RxStatefulConfig<any> = {
      suspenseTimeMs: 2,
      suspenseThresholdMs: 2,
      keepValueOnRefresh: false,
      keepErrorOnRefresh: false,
    };
    describe('Observable Signature', () => {
      it('should not emit suspense state when source emits before suspenseThreshold is exceeded', () => {
        /**
         * s$         -a
         * refresh    ----a
         * expected   -a--a
         */
        runWithTestScheduler(({ expectObservable, cold }) => {
          const s$ = cold('-a|', { a: 1 });
          const refresh$ = cold('----a-', { a: void 0 });
          const expected = '-a---';
          const source$ = rxStateful$(s$, { ...defaultConfig, refetchStrategies: [withRefetchOnTrigger(refresh$)] });

          expectObservable(source$).toBe(
            expected,
            marbelize({
              a: {
                hasError: false,
                error: undefined,
                context: 'next',
                value: 1,
                hasValue: true,
                isSuspense: false,
              },
            })
          );
        });
      });
      it('should should emit suspense state when source emits after suspenseThreshold is exceeded', () => {
        /**
         * s$         ---a
         * expected   ---s--a
         */
        runWithTestScheduler(({ expectObservable, cold }) => {
          const s$ = cold('---a|', { a: 1 });
          const expected = '--s-a';
          const source$ = rxStateful$(s$, { ...defaultConfig });

          expectObservable(source$).toBe(
            expected,
            marbelize({
              a: {
                hasError: false,
                error: undefined,
                context: 'next',
                value: 1,
                hasValue: true,
                isSuspense: false,
              },
              s: {
                hasError: false,
                hasValue: false,
                value: null,
                context: 'suspense',
                isSuspense: true,
                error: undefined,
              },
            })
          );
        });
      });
      it('should keep suspense state as long as source takes when it takes longer than supsenseThreshold + suspenseTime', () => {
        /**
         * s$         ------a
         * expected   --s---a
         */
        runWithTestScheduler(({ expectObservable, cold }) => {
          const s$ = cold('------a|', { a: 1 });
          const expected = '--s---a';
          const source$ = rxStateful$(s$, { ...defaultConfig });

          expectObservable(source$).toBe(
            expected,
            marbelize({
              a: {
                hasError: false,
                error: undefined,
                context: 'next',
                value: 1,
                hasValue: true,
                isSuspense: false,
              },
              s: {
                hasError: false,
                hasValue: false,
                value: null,
                context: 'suspense',
                isSuspense: true,
                error: undefined,
              },
            })
          );
        });
      });
    });
    describe('Callback Signature', () => {
      it('should not emit suspense state when source emits before suspenseThreshold is exceeded', () => {
        /**
         * s$         -a
         * trigger$   a--b-
         * expected   -a--b
         */
        runWithTestScheduler(({ expectObservable, cold }) => {
          const s$ = (n: number) => cold('-a|', { a: n });
          const trigger$ = cold('a--b-', { a: 1, b: 2 });
          const expected = '-a--b';
          const source$ = rxStateful$((n) => s$(n), { ...defaultConfig, sourceTriggerConfig: { trigger: trigger$ } });

          expectObservable(source$).toBe(
            expected,
            marbelize({
              a: {
                hasError: false,
                error: undefined,
                context: 'next',
                value: 1,
                hasValue: true,
                isSuspense: false,
              },
              b: {
                hasError: false,
                error: undefined,
                context: 'next',
                value: 2,
                hasValue: true,
                isSuspense: false,
              },
            })
          );
        });
      });
      it('should should emit suspense state when source emits after suspenseThreshold is exceeded', () => {
        /**
         * s$         --a
         * trigger$   a----b------
         * expected   --s--a--s--a
         */
        runWithTestScheduler(({ expectObservable, cold }) => {
          const s$ = (n: number) => cold('---a|', { a: n });
          const trigger$ = cold('a----b------', { a: 1, b: 2 });
          const expected = '--s-a--s-b';
          const source$ = rxStateful$((n) => s$(n), { ...defaultConfig, sourceTriggerConfig: { trigger: trigger$ } });

          expectObservable(source$).toBe(
            expected,
            marbelize({
              a: {
                hasError: false,
                error: undefined,
                context: 'next',
                value: 1,
                hasValue: true,
                isSuspense: false,
              },
              b: {
                hasError: false,
                error: undefined,
                context: 'next',
                value: 2,
                hasValue: true,
                isSuspense: false,
              },
              s: {
                hasError: false,
                error: undefined,
                context: 'suspense',
                value: null,
                hasValue: false,
                isSuspense: true,
              },
            })
          );
        });
      });
      it('should keep suspense state as long as source takes when it takes longer than supsenseThreshold + suspenseTime', () => {
        /**
         * s$         ------a
         * trigger$   a--------b-------
         * expected   --s---a----s---b-----
         */
        runWithTestScheduler(({ expectObservable, cold }) => {
          const s$ = (n: number) => cold('------a|', { a: n });
          const trigger$ = cold('a--------b-------', { a: 1, b: 2 });
          const expected = '--s---a----s---b-----';
          const source$ = rxStateful$((n) => s$(n), { ...defaultConfig, sourceTriggerConfig: { trigger: trigger$ } });

          expectObservable(source$).toBe(
            expected,
            marbelize({
              a: {
                hasError: false,
                error: undefined,
                context: 'next',
                value: 1,
                hasValue: true,
                isSuspense: false,
              },
              b: {
                hasError: false,
                error: undefined,
                context: 'next',
                value: 2,
                hasValue: true,
                isSuspense: false,
              },
              s: {
                hasError: false,
                error: undefined,
                context: 'suspense',
                value: null,
                hasValue: false,
                isSuspense: true,
              },
            })
          );
        });
      });
    });
  });
});

function runWithTestScheduler<T>(callback: (helpers: RunHelpers) => T) {
  const testScheduler = new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected);
  });

  return testScheduler.run(callback);
}

function marbelize(marbles: Record<string, Partial<RxStateful<any>>>) {
  return marbles;
}
