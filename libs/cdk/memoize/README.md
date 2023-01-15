# @angular-kit/cdk/memoize

Library providing memoization functionality via:
* a `memoize`-function
* a `Memoize`-decorator


## Usage

### Decorator Usage
Annotate the function you want to memoize using the `Memoize`-decorator:

```typescript
class Test {
  @Memoize()
  calculate(a: number, b: number): number {
    return a + b;
  }
}
```

### Function usage
Use the `memoize`-function:

```typescript
class Test {
  calc(a: number, b: number): number {
    return memoize((a, b) => a + b).memoized(a, b);
  }
}
```
