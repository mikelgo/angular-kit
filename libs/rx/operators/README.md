# @angular-kit/operators

A set of powerful RxJS operators for building reactive Angular applications.

## 🔋 Included

## Creation functions

- 'rxSource': create a new hot and lazy observable from a source observable or value

## Operators

### Flattening operators
- `rxSwitchMap`: `switchMap` with error handling
- `rxMergeMap`: `mergeMap` with error handling
- `rxConcatMap`: `concatMap` with error handling
- `rxExhaustMap`: `exhaustMap` with error handling

#### Usage

```typescript
import { rxSwitchMap } from '@angular-kit/rx/operators';


this.source$.pipe(
  // ❌ instead of 
  // switchMap(value => this.service.get(value).pipe(
  // catchError(error => of(error))
  // ✅ do this: 
  rxSwitchMap((value) => this.service.get(value))
).subscribe();
```
Each operator does support different error handling strategies. By default
the error is catched and returned. 

Other strategies can be used by passing a second argument to the operator:
- `rxSwitchMap(v => this.service.get(v), 'swallow')'`: will swallow the error and just continue
- `rxSwitchMap(v => this.service.get(v), 'retry-default')'`: will retry up to two times with a delay of 1s. On success the counter is reset.
- `rxSwitchMap(v => this.service.get(v), {)'`: you can pass an own `RetryConfig` object to customize the retry behavior. See [Rxjs docs](https://rxjs.dev/api/index/interface/RetryConfig) for more information.
- `rxSwitchMap(v => this.service.get(v), catchError(err => whatever)'`: apply a totally custom error handling strategy by passing Rxjs Operators.



### Filter operators

- `rxFilterNull`: Filters out nullish values
- `rxFilterUndefined`: Filters out undefined values
- `rxFilterForValue`: Filters out nullish values and undefined values


> 🔥
> The filter operators will also ensure correct type inference. When using the default
> RxJs filter operators (e.g. filter(v => v !== undefined)) the type of the resulting observable
> will still contain ` | undefined` which is not what you want as you know that you filtered
> out undefined values.

 ### Other operators

#### `rxPluck`
Same as the former `pluck` operator from RxJS which got deprecated in RxJS v7.

![rxPluck marble](../../../docs/images/marbles/rx-pluck.png)

#### `rxDistinctUntilChanged` 
A distinctUntilChanged operator that deeply compares any values efficiently

#### `rxWrap`: 
A util-operator which ensures a shared and distinct observable is used. This operator combines under 
the hood `distinctUntilChanged`, `rxFilterUndefined` and `share`.

Example
```ts

obs$ = of(10).pipe(
    rxWrap(
        map(v => v * 2),
        map(v => v + 1),
    )
)
```
