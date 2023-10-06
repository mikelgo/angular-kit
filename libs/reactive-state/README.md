# devkit/state

## Usage

You can use `ReactiveState` in smart and dumb components, as well as in Services.
Basically in every piece of your application where you want to manage some kind of state. This
can be global as well as local state.

### Example

```

interface SmartComponentState {
 items: Person[];
 personCount: number;
 personListVisible: boolean;
}

@Component({
    template: `
        <div *ngIf="vm$ | async as vm">
            {{vm.personCount}}
            <presentational-component *ngif="vm.personListVisible"  [items]="vm.items" />
        </div>
    `

})
export class SmartComponent {
    private readonly state = reactiveState<SmartComponentState>(({connect, initialize}) => {
        initialize({
            items: [],
            personCount: 0,
            personListVisible: false
        })

        connect({items: inject(PersonService).getAll()})
        connect({
            personCount: state => state.items.length,
            personListVisible: state => state.items.length > 0
        })
    )

    vm$ = this.state.select();
}

interface PresentationalComponentState {
    items: Person[]
}

@Component({})
export class PresentationalComponent{
    @Input items: Person[] = []
    private readonly state = reactiveState<PresentationalComponentState>(({initialize}) => {
        initialize({items: []})
    }, {connectInputs: this})
}
```

### Gotcha's

> **Caution**  
> It is recommended to always call `initialize` on your state instance to make sure
> that there is always a value for your state. If you e.g. have no state value and
> call the `.pick()`-method you will run into an error

## Running unit tests

Run `nx test devkit-state` to execute the unit tests.
