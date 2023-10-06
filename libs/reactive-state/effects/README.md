# devkit/effects

Tooling to handle your effects (subscriptions)!

## Included

-   `reactiveEffects`
-   `createEffect`

## `reactiveEffects`

`reactiveEffects` is a smart function to handle any effect inside your Angular components with less boilerplate code.

### Classic way

```typescript

@Component()
export class Component implements OnDestroy{
    destroy$ = new Subject()
    refreshList$ = interval(1000).pipe(switchMap(() => this.service.getList()))

    constructor() {
      this.refreshList$.pipe(takeUntil(this.destroy$)).subscribe(...)

    }
    ngOnDestroy(){
        this.destroy$.next();
        this.destroy$.complete()
    }
}
```

### with `reactiveEffects`

```typescript

@Component()
export class Component {
    refreshList$ = interval(1000).pipe(switchMap(() => this.service.getList()))

    constructor() {
        reactiveEffects(({register}) => register(this.refreshList$.subscribe(...)))
    }
}
```

## `createEffect`

Turn imperative code easily into declarative code.

### Usage

Turn this:

```typescript
@Component({})
export class Component {
    constructor(private dialog: MatDialog) {}

    openDialog() {
        this.dialog.open(DialogComponent).afterClosed().subsbribe(console.log);
    }
}
```

Into this:

```typescript
@Component({
  ...
  template: `<button (click)="openDialog$$.next(void 0)">Open dialog</button>`,
})
export class Component {
  protected readonly openDialog$$ = new Subject<void>()

  readonly dialogAfterClosed$ = createEffect(
      () => this.dialog.open(DialogComponent).afterClosed,
    this.openDialog$$
  )

  constructor(
      private dialog: MatDialog,
  ) {

      this.dialogAfterClosed$.subscribe(console.log)
  }


}
```

## Running unit tests

Run `nx test devkit-effects` to execute the unit tests.
