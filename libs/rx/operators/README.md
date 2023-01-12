# @code-workers.io/angular-kit/operators

A set of powerful RxJS operators for building reactive Angular applications.

## 🔋 Included

## Creation functions

- 'rxSource': create a new hot and lazy observable from a source observable or value

## Operators

### Filter operators

- `rxFilterNull`: Filters out nullish values
- `rxFilterUndefined`: Filters out undefined values
- `rxFilterForValue`: Filters out nullish values and undefined values

### Other operators

- `rxDistinctUntilChanged`: A distinctUntilChanged operator that deeply compares any values

> 🔥
> The filter operators will also ensure correct type inference. When using the default
> RxJs filter operators (e.g. filter(v => v !== undefined)) the type of the resulting observable
> will still contain ` | undefined` which is not what you want as you know that you filtered
> out undefined values.
