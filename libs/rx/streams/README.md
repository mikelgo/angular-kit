# @angular-kit/streams

Reduce boilerplate code when working with RxJS subjects.

- 🦥 lazy by default
- ✅ reduce boilerplate
- ✅ [no late subscriber problem](https://trilon.io/blog/dealing-with-late-subscribers-in-rxjs)

The package includes two functions for creating streams (observables):
- `createStream` - creates a stream with a single value
- `createStreams` - creates multiple streams from a type definition

## Usage

### `createStream`

```typescript
import { createStream } from '@angular-kit/streams';
import { Component } from '@angular/core';
import { scan } from 'rxjs';

@Component({
  selector: 'app-root',
  template: `
    <button (click)="stream.send(1)">Click me</button>

    <div *ngIf="streamValue$ | async as value">
      {{ value }}
    </div>
  `,
})
export class AppComponent {
  stream = createStream<number>();

  streamValue$ = this.stream.$.pipe(scan((acc, value) => acc + value, 0));
}
```

### Use `createStream` together with @Input()

```typescript
import {createStream} from '@angular-kit/streams';
import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-some',
  template: `
    <div *ngIf="stream.$ | async as value">
      {{ value }}
    </div>
  `,
})
export class SomeComponent {
  stream = createStream<number>();

  @Input()
  set value(value: number) {
    this.stream.send(value);
  }
}
```

### `createStreams`

```typescript
import { createStreams } from '@angular-kit/streams';
import { Component } from '@angular/core';
import { scan } from 'rxjs';

interface SomeStreams {
  value: number;
}
@Component({
  selector: 'app-root',
  template: `
    <button (click)="streams.value(1)">Click me</button>

    <div *ngIf="streamValue$ | async as value">
      {{ value }}
    </div>
  `,
})
export class AppComponent {
  streams = createStreams<SomeStreams>();

  streamValue$ = this.streams.value$.pipe(scan((acc, value) => acc + value, 0));
}
```
