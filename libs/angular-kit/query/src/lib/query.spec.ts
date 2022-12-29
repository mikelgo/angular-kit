import { of } from 'rxjs';
import { marbles } from 'rxjs-marbles';
import { query$ } from './query';

describe('query$', () => {
  it('should return a Query<T> object with isLoading set to true initially', marbles((m) => {
    const source$ = m.cold('--a--b--c--d--|', { a: 1, b: 2, c: 3, d: 4 });
    const expected$ = m.cold('--x--y--z--w--|', { x: { isLoading: true, isRefreshing: false, value: undefined }, y: { isLoading: false, isRefreshing: false, value: 1 }, z: { isLoading: false, isRefreshing: false, value: 2 }, w: { isLoading: false, isRefreshing: false, value: 3 } });
    const result$ = query$(source$);
    m.expect(result$).toBeObservable(expected$);
  }));

  /*
  it('should return a Query<T> object with isLoading set to true and isRefreshing set to true when refreshCommand$ emits', marbles((m) => {
    const source$ = m.cold('--a--b--c--d--|', { a: 1, b: 2, c: 3, d: 4 });
    const refreshCommand$ = m.cold('--r--r--r--r--|', { r: null });
    const expected$ = m.cold('--x--y--z--w--|', { x: { isLoading: true, isRefreshing: true, value: undefined }, y: { isLoading: false, isRefreshing: false, value: 1 }, z: { isLoading: false, isRefreshing: false, value: 2 }, w: { isLoading: false, isRefreshing: false, value: 3 } });
    const result$ = query$(source$, refreshCommand$);
    m.expect(result$).toBeObservable(expected$);
  }));
  */


  it('should return a Query<T> object with isLoading set to false and value set to null when source$ emits an error', marbles((m) => {
    const source$ = m.cold('--a--#', { a: 1 }, new Error('error'));
    const expected$ = m.cold('--x--y--|', { x: { isLoading: true, isRefreshing: false, value: undefined }, y: { isLoading: false, isRefreshing: false, value: null } });
    const result$ = query$(source$);
    m.expect(result$).toBeObservable(expected$);
  }));
});
