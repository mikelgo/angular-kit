# @angular-kit/effect

You don't longer need to worry about handling subscriptions!

## Usage

```typescript

@Component({
  ...
    providers: [Effect]
})
export class Component {

  constructor(private effects: Effect) {
    this.effects.run(observable$, console.log)
    this.effects.run(observable$.subscribe(console.log))
  }

}

```
