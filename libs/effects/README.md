# @angular-kit/effects
A modern toolkit using the latest Angular features to effectively manage your effects/subscriptions with zero-boilerplate code needed.

Tooling to handle your effects (subscriptions)!

## Included
* `effects`

### `effects`

`effects` is a convenience function which acts as a container to take care of
multiple subscriptions and execute side effects. It will **automatically** and **safely** unsubscribe from 
any observable. 

#### Usage
*Note* that you need to use `effects` within an injection context. If you want to
use it outside an injection context you can pass the `Ìnjector` as argument.

```ts
const eff = effects(({run, runOnCleanUp}) => {
    run(interval(1000), v => console.log(v))
    // register more effects
  runOnCleanUp(() => {
    // e.g. save something to local storage
  })
})
```

You also get fine-grained hooks to run code on clean-up of a single effect:
  
  ```ts
  const eff = effects();
  const intervalEffect = eff.run(interval(1000), v => console.log(v), {
    onCleanUp: () => {
      // e.g. save something to local storage
    }
  });
  ```

The `onCleanUp`-function will be executed either when `intervalEffect.cleanUp()` is called or when
the `effects`-instance is destroyed. **Note** the `onCleanUp`-function will run only **once**.

#### Comparison

###### Without `effects` pre Angular 16
There are several well-established patterns to handle subscriptions in Angular. This example uses plain
subscriptions and unsubscribes in the `ngOnDestroy` lifecycle hook.
```ts
@Component(...)
export class AppComponent implements OnDestroy {
    private subscription: Subscription;

    constructor() {
        this.subscription = interval(1000).subscribe(v => console.log(v));
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
```

###### Without `effects` post Angular 16
There are several well-established patterns to handle subscriptions in Angular. This example uses plain
subscriptions and unsubscribes in the `ngOnDestroy` lifecycle hook.
```ts
@Component(...)
export class AppComponent {
    private subscription: Subscription;

    constructor() {
        this.subscription = interval(1000).subscribe(v => console.log(v));
        inject(DestroyRef).onDestroy(() => this.subscription.unsubscribe());
    }
}
```
###### With `effects` 
```ts
@Component(...)
export class AppComponent {
    private eff = effects();

    constructor() {
        this.eff.run(interval(1000).subscribe(v => console.log(v));
    }
}
```

# Version compatibility
`@angular-kit/effects` is compatible with Angular versions 16 and above and it requires RxJs >= 7.0.0.
