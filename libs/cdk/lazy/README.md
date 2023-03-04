# @angular-kit/cdk/lazy

A package which offers utilities to lazy load JavaScript libraries.

## 🔋 Included

- `LazyService`
- `LazyPipe`

## Usage

### `LazyService`

```typescript
import { LazyService } from '@angular-kit/cdk/lazy';

@Component({
})
export class Component {
    private readonly lazy = inject(LazyService);
  constructor() {
      // assumption that moment is installed as dependency
    this.lazy.run((m) => m.default.now(), () => import('moment'))

  }
}
```

### `LazyPipe`

```html
<div *ngIf="visible">
   Now : {{ formatFn | lazy:moment | async}}
</div>
```

```typescript
formatFn = (m: any) => {
    return m.default.now()
  }
  moment =  () => import('moment')
```

It is also possible to e.g. load JavaScript from a CDN and then use Service or Pipe.
