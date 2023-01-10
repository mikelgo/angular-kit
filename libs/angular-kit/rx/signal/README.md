# @code-workers.io/angular-kit/signal

Reduce boilerplate code when working with RxJS subjects.

- 🦥 lazy by default
- ✅ reduce boilerplate
- ✅  [no late subscriber problem](https://trilon.io/blog/dealing-with-late-subscribers-in-rxjs)

## Usage

```typescript
import { createSignal } from '@code-workers.io/angular-kit/signal';
import { Component } from '@angular/core';
import { scan } from 'rxjs';

@Component({
  selector: 'app-root',
  template: `
    <button (click)="signal.next(1)">Click me</button>

    <div *ngIf="signalValue$ | async as value">
      {{ value }}
    </div>
  `,
})
export class AppComponent {
  signal = createSignal<number>();

  signalValue$ = this.signal.$.pipe(scan((acc, value) => acc + value, 0));
}
```

### Use `createSignal` together with @Input()

```typescript
import { createSignal } from '@code-workers.io/angular-kit/signal';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-some',
  template: `
    <div *ngIf="signal.$ | async as value">
      {{ value }}
    </div>
  `,
})
export class SomeComponent {
  signal = createSignal<number>();

  @Input()
  set value(value: number) {
    this.signal.next(value);
  }
}
```
