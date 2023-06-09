# @angular-kit/rx-hooks

`rx-hooks` gives you finally reactive lifecycle hooks for Angular.

## Installation

Run `npm install @angular-kit/rx-hooks` to install the library.

## Usage

```typescript
import {RxHooks$} from "@angular-kit/rx-hooks";

@Component({
  // ...
  hostDirectives: [RxHooks$]
})
export class MyComponent {
  hooks$ = inject(RxHooks$)

  constructor() {
      this.hooks$.onInit$.subscribe(() => console.log('onInit'))
      this.hooks$.onDestroy$.subscribe(() => console.log('onDestroy'))
      this.hooks$.onDoCheck$.subscribe(() => console.log('onDoCheck'))
      this.hooks$.onAfterContentInit$.subscribe(() => console.log('onAfterContentInit'))
      this.hooks$.onAfterContentChecked$.subscribe(() => console.log('onAfterContentChecked'))
  }
}
```

## Supported hooks
All hooks except `ngOnChanges` are supported.

## Versioning
The versioning of this library follows the versioning of Angular.
