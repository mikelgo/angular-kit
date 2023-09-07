# @angular-kit/rx-stateful/testing

This package contains some testing utilities for the `@angular-kit/rx-stateful` package.

## Included

- `mockRxStateful`- a function that returns a mock of the `RxStateful` class. It can be used to test components that use the `RxStateful` class.

## Usage

```ts

import {mockRxStateful, RxStatefulMock} from '@angular-kit/rx-stateful/testing';
import {HttpErrorResponse} from "@angular/common/http";


const mock = mockRxStateful<string, HttpErrorResponse>()
mock.hasError$Trigger.next(false);
mock.state$Trigger.next({value: 'some', isSuspense: false});

```
