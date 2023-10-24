# @angular-kit/rx-stateful

`rxStateful$` is a powerful RxJs operator that wraps any sync or async Observable and provides a
stateful stream.

Hint: You can use it on both sync and async Observables. However the real benefits you will get for async Observables.

## Installation
```bash

npm install @angular-kit/rx-stateful
yarn add @angular-kit/rx-stateful
pnpm add @angular-kit/rx-stateful
  
  ```
## Demo
A live demo is available on [Stackblitz](https://stackblitz.com/edit/stackblitz-starters-l9nwsp?file=src%2Fmain.ts)

## Usage
### `rxStateful$` as standalone function
#### Sync source Observable
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
const stateful$ = rxStateful$(of(1, 2, 3));
```

#### Async source Observable
```typescript
import { rxStateful$ } from '@angular-kit/rx-stateful';

/**
 * Async Observable will return: 
 * [
 * { value: null, hasValue: false, context: 'suspense', hasError: false, error: undefined },
 * { value: SOME_VALUE, hasValue: true, context: 'next', hasError: false, error: undefined },
 * ]
 */

const stateful$ = rxStateful$(from(fetch('...')));
```

### API
#### Observable based API
`rxStateful$` returns a Observable of with following properties:
- `value` - the value
- `hasValue` - boolean if a value is present
- `context` - the context of the stream ('suspense', 'next', 'error', 'complete')
- `hasError` - boolean if an error is present
- `error` - the error, if present
- `isSuspense` - suspense/loading state


### Configuration
`rxStateful$` provides configuration possibility on instance level:

#### Configuration on instance level

You can also provide a configuration on instance level. This will also override the global configuration (if present).

`rxStateful$` takes a configuration object as second parameter. The following options are available:
- `keepValueOnRefresh` - boolean if the value should be kept when the `refreshTrigger$` emits. Default: `false`
- `refreshTrigger$` - a Subject that triggers the source again. Default: not set

```typescript
import { rxStateful$ } from '@angular-kit/rx-stateful';

const rxStateful$ = rxStateful$(someSource$, { keepValueOnRefresh: true });
```

### Usage via `RxStatefulClient`
In order to use `RxStatefulClient` you first need to provide it, e.g. in your `AppModule`:

```typescript
import {provideRxStatefulClient} from "@angular-kit/rx-stateful";

@NgModule({
    providers: [
        provideRxStatefulClient()
    ],
})
export class AppModule {}
```
``RxStatefulClient`` offers a `request`-method which basically has the same signature as `rxStateful$` - so there'is no 
difference in usage.

#### Global configuration 
``provideRxStatefulClient()`` can be configured: 
```typescript
import {provideRxStatefulClient, withConfig} from "@angular-kit/rx-stateful";

@NgModule({
    providers: [
        provideRxStatefulClient(withConfig({ keepValueOnRefresh: true}))
    ],
})
export class AppModule {}
```
The global configuration will be used for every `request`-call. You can still override the global configuration by
providing a configuration object as second parameter to `request`-method.

## Configuring refresh behaviour
Both `rxStateful$` and `RxStatefulClient` can be configured to refresh the source (e.g. make a HTTP call again).  

To define the refresh behaviour you can make use of so called `RefetchStrategy`'s. Right now there are following strategies
built in: `withAutoRefetch` and `withRefetchOnTrigger`.

### Usage on `rxStateful$`
```typescript
```typescript
    const instance = rxStateful$(fetch(), { refetchStrategy: [withAutoRefetch(1000, Infinity)] })
```
### Usage on `RxStatefulClient`

```typescript


const client = inject(RxStatefulClient);
const instance = client.request(fetch(), { refetchStrategy: [withAutoRefetch(1000, Infinity)] })
```

All strategies can be cominded in an arbitrary way.

In the future there will come more strategies built in, as well as an easy way to define custom strategies. However defining
custom strategies is already possible by implementing the `RefetchStrategy` interface.

## Testing
Please have a look at the [testing documentation](./testing/README.md).

## Versioning
This project follows [Semantic Versioning](https://semver.org/).

- Version `1.x.x` supports Angular >=14.0.0

## License
MIT

## Contributing
Any Contributions are welcome. Please open up an issue or create PR if you would like to contribute.

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for more information.
