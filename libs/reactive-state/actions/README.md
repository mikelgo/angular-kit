# devkit-action

> This package provides a quick way to create reactive (user) interactions with less boilerplate.

## Key features

-   Fully Typed
-   No-Boilerplate
-   Configurable transformations to have lines in the template

## Motivation

Actions are a fundamental part of state management and reactive systems.

Typically, Subjects are used to implement this functionality. However, in larger applications, this approach often results in code cluttered with Subjects, leading to increased complexity.

That's where this package comes in. It allows you to create observable action streams in a clean, maintainable, and less error-prone way, thus minimizing the amount of boilerplate code required.

### Basic usage

By using ReactiveActions we can reduce the boilerplate significantly, to do so we can start by thinking about the specific section their events and event payload types:

```typescript
interface Actions {
    refreshUser: string | number;
    refreshList: string | number;
    refreshGenres: string | number;
}
```

Next we can use the typing to create the action object:

```typescript
const actions = reactiveActions<Actions>();
```

The object can now be used to emit operations over setters:

```typescript
actions.refreshUser(value);
actions.refreshList(value);
actions.refreshGenres(value);
```

The emitted operations can be received over observable properties:

```typescript
const refreshUser$ = actions.refreshUser$;
const refreshList$ = actions.refreshList$;
const refreshGenres$ = actions.refreshGenres$;
```

If there is the need to make a combined operation you can also select multiple operations and get their emissions in one stream:

```typescript
const refreshUserOrList$ = concat(actions.refreshUser$, actions.refreshList$);
```

### Operations in components

In components/templates we can use operations to map user interaction as well as programmatic to effects or state changes.
This reduces the component class code as well as template.

In addition, we can use it as a shorthand in the template and directly connect to action dispatching in the class.

```typescript
interface UiActions {
  submitBtn: void;
  searchInput: string;
}

@Component({
  template: `
    <input (input)="ui.searchInput($event.target.value)" /> Search for:
    {{ ui.searchInput$ | async }}<br />
    <button (click)="ui.submitBtn()">
      Submit<button>
        <br />
        <ul>
          <li *ngFor="let item of list$ | async as list">{{ item }}</li>
        </ul>
      </button>
    </button>
  `,
  providers: [RxState, RxActionFactory],
})
class Component {
  ui = reactiveActions<UiActions>({ searchInput: (e) => e });
  submittedSearchQuery$ = this.ui.submitBtn$.pipe(
    withLatestFrom(this.ui.searchInput$),
    map(([_, search]) => search),
    debounceTime(1500)
  );


```

#### Using transforms

Often we process `Events` from the template and occasionally also trigger those channels in the class programmatically.

This leads to a cluttered codebase as we have to consider first the value in the event which leads to un necessary and repetitive code in the template.
This is also true for the programmatic usage in the component class or a service.

To ease this pain we can manage this login with `transforms`.

You can write you own transforms or use the predefined functions:

-   preventDefault
-   stopPropagation
-   preventDefaultStopPropagation
-   eventValue

```typescript
import { Component } from '@angular/core';
import { StateService } from './state.service';
import { withLatestFrom, map, debounceTime } from 'rxjs/operators';
import { reactiveActions, eventValue } from '@devkit/actions';

interface UiActions {
    submitBtn: void;
    searchInput: string;
}

@Component({
    selector: 'my-component',
    template: `
        <input (input)="ui.searchInput($event)" /> Search for: {{ ui.searchInput$ | async }}<br />
        <button (click)="ui.submitBtn()">Submit</button>
        <br />
        <ul>
            <li *ngFor="let item of list$ | async">{{ item }}</li>
        </ul>
    `,
    providers: [RxState, RxActionFactory]
})
export class MyComponent {
    ui = reactiveActions<UiActions>({ searchInput: eventValue });
    list$ = this.state.select('list');
    submittedSearchQuery$ = this.ui.submitBtn$.pipe(
        withLatestFrom(this.ui.searchInput$),
        map(([_, search]) => search),
        debounceTime(1500)
    );

    constructor(
        private state: State<State>,
        private factory: RxActionFactory<UiActions>,
        private globalState: StateService
    ) {
        this.state.connect('list', this.globalState.refreshGenres$);

        this.state.hold(this.submittedSearchQuery$, this.globalState.refreshGenres);
        // Optional reactively:
        // this.globalState.connectRefreshGenres(this.submittedSearchQuery$);
    }
}
```

## Running unit tests

Run `nx test devkit-action` to execute the unit tests.
