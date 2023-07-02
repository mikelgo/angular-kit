# @angular-kit/effect

Tooling to handle your effects (subscriptions)!

## 🔋 Included
- [`runEffect$`](#runEffect$): Subscribe without subscribing to get subscription-less components.
- [`Effect`](#EffectService): Subscribe without subscribing to get subscription-less components.
- [`createEffect`](#createEffect): Create an effect to turn imperative code into declarative code.

## `runEffect$`

### Usage

```typescript
@Component({
  ...
})
export class Component {
    constructor() {
        runEffect$(observable$, console.log)
        runEffect$(observable$.subscribe(console.log))
        runEffect$(observable$, (v) => console.log(v))
    }
}


```
If you want to run an effect outside a injection context (field declaration or constructor) you will need to pass
the `Injector` as parameter.

## `Effect` - deprecated
NOte: will be removed in the next major version after 2.x.x. Use `runEffect$` instead.
### Usage

```typescript

@Component({
  ...
    providers: [provideEffect()]
})
export class Component {
  private effects = injectEffect();
  constructor() {
    this.effects.run(observable$, console.log)
    this.effects.run(observable$.subscribe(console.log))
  }

}

```

## `createEffect`
Turn imperative code easily into declarative code.
### Usage

Turn this:
```typescript
@Component({
  ...
  providers: [Effect]
})
export class Component {
  constructor(
      private dialog: MatDialog,
  ) {
      
  }

  openDialog() {
    this.dialog.open(DialogComponent).afterClosed().subsbribe(console.log)
  }

}
```

Into this:

```typescript
@Component({
  ...
  template: `<button (click)="openDialog$$.next(void 0)">Open dialog</button>`,
  providers: [Effect]
})
export class Component {
  protected readonly openDialog$$ = new Subject<void>()
  
  readonly dialogAfterClosed$ = createEffect(
      () => this.dialog.open(DialogComponent).afterClosed, 
    this.openDialog$$
  )

  constructor(
      private dialog: MatDialog,
      private effects: Effect
  ) {
      
      this.effects.run(this.dialogAfterClosed$, console.log)
  }


}
```
