# @angular-kit/rx-stateful

`rxStateful$` is a powerful RxJs operator that wraps any sync or async Observable and provides a
stateful stream.

## Installation
```bash

npm install @angular-kit/rx-stateful
yarn add @angular-kit/rx-stateful
pnpm add @angular-kit/rx-stateful
  
  ```
## Demo
A live demo is available on [Stackblitz](https://stackblitz.com/edit/stackblitz-starters-l9nwsp?file=src%2Fmain.ts)

## Usage

### Sync source Observable
```typescript
import { rxStateful$ } from '@angular-kit/rx-stateful';

/**
 * Sync Observable will return: 
 * [
 * { value: 1, hasValue: true, context: 'next', hasError: false, error: undefined },
 * { value: 2, hasValue: true, context: 'next', hasError: false, error: undefined },
 * { value: 3, hasValue: true, context: 'next', hasError: false, error: undefined },
 * ]
 */
const stateful$ = rxStateful$(of(1, 2, 3)).state$;
```

### Async source Observable
```typescript
import { rxStateful$ } from '@angular-kit/rx-stateful';

/**
 * Async Observable will return: 
 * [
 * { value: null, hasValue: false, context: 'suspense', hasError: false, error: undefined },
 * { value: SOME_VALUE, hasValue: true, context: 'next', hasError: false, error: undefined },
 * ]
 */

const stateful$ = rxStateful$(from(fetch('...'))).state$;
```

For async Observables you can also make use of a `refreshTrigger$` to trigger the async operation again. You can 
also configure if the value should be reset to `null` when the `refreshTrigger$` emits or if it should be kept.

```typescript
import { rxStateful$ } from '@angular-kit/rx-stateful';

const refreshTrigger$ = new Subject();
const stateful$ = rxStateful$(from(fetch('...')), {keepValueOnRefresh: true, refreshTrigger$}).state$;
```

## API
### Observable based API
`rxStateful$` returns several Observables:
- `state$` - the stateful stream with all information combined
- `value$` - the value
- `hasValue$` - boolean if a value is present
- `context$` - the context of the stream ('suspense', 'next', 'error', 'complete')
- `hasError$` - boolean if an error is present
- `error$` - the error if present

### Signal based API
`rxStateful$` returns several `Signals` when `useSignals: true` is set in the configuration object: `rxStateful$(source$, {useSignals: true})`
- `state` - the stateful stream with all information combined
- `value` - the value
- `hasValue` - boolean if a value is present
- `context` - the context of the underlying stream ('suspense', 'next', 'error', 'complete')
- `hasError` - boolean if an error is present
- `error` - the error if present

It behaves the same as the Observable based API but instead of returning Observables it returns Signals.

### Configuration
`rxStateful$` takes a configuration object as second parameter. The following options are available:
- `keepValueOnRefresh` - boolean if the value should be kept when the `refreshTrigger$` emits. Default: `false`
- `refreshTrigger$` - a Subject that triggers the source again. Default: not set
- `useSignals` - boolean if the API should return Signals instead of Observables. Default: `false`


## Versioning
This project follows [Semantic Versioning](https://semver.org/).

- Version `1.x.x` supports Angular <=15.x.x
- Version `2.x.x` supports Angular >=16.x.x as it makes use of tne new Angular Signals

## License
MIT

## Contributing
Any Contributions are welcome. Please open up an issue or create PR if you would like to contribute.

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for more information.
