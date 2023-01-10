# @code-workers.io/angular-kit/operators

A set of powerful RxJS operators for building reactive Angular applications.

## 🔋 Included

### Filter operators

- `filterNull`: Filters out nullish values
- `filterUndefined`: Filters out undefined values
- `filterForValue`: Filters out nullish values and undefined values

> 🔥
> The filter operators will also ensure correct type inference. When using the default
> RxJs filter operators (e.g. filter(v => v !== undefined)) the type of the resulting observable
> will still contain ` | undefined` which is not what you want as you know that you filtered
> out undefined values.
