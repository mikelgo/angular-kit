# @angular-kit/cdk/template

A package providing some useful Angular ehancements for templates.

##  🔋 Included
* `*rxIfList` - `*ngIf` for lists.
* `runFn` - a pipe to run any function in the template without triggering change detection on every CD cycle.
* `ngForTrackById` - a directive to track `ngFor` by id.
* `ngForTrackByProp` - a directive to track `ngFor` by property.

### `*rxIfList`
A structural directive that works like `*ngIf` but for lists. It will only render the template if the list is not empty.

The term list does include: arrays and interables.
```html
<ul>
  <li *rxIfList="[1,2,3]">List is not empty</li>
</ul>

```
Similar to `ngIf` `rxIfList` supports templates for `then` and `else`:
```html
<ul>
  <li *rxIfList="[1,2,3]; then thenTpl else emptyListTpl"></li>
</ul>
<ng-template #thenTpl let-value >List is not empty. Value: {{value}}</ng-template>
<ng-template #emptyListTpl>List is empty.</ng-template>
```
`*rxIfList` does accept also `observables` as argument: `*rxIfList="list$"`, where `list = of([1,2,3])`.

#### `RunFnPipe`
This pipe will run any function of your component and
make use of Angular's memoization to prevent unnecessary
re-evaluations which will result in less change detection cycles.

Example using a pure function
```
@Component({
  selector: 'my-component',
  template: `
    <div>
      {{ sum | runFn:2:5 }}
    </div>
  `
})
export class MyComponent {
  
  // a pure function can easily be used like this:  {{ sum | runFn:2:5 }}
  sum(a: number, b: number) {
    return a + b;
  }
}
```
Example using im-pure functions (functions containing a `this`-reference
```
@Component({
  selector: 'my-component',
  template: `
    <div>
        {{ num | fn: value }}
    </div>
    <div>
        {{ myfn | fn }}
    </div>
  `
})
export class MyComponent {
  value = 10;
    // 1a) a pure function can easily be used like this:  {{ sum | runFn:2:5 }}
   num(a: number) {
    return a;
  }
  
   // 1b) wrapping in a arrow function will scope this correctly 
   myfn = () => {
    return this.value
  };
}
```

#### `ngForTrackById`
A directive to track `ngFor` by id which results in a shorthand for `trackBy: (index, item) => item.id`.

```html
<ul>
  <li *ngFor="let item of items; trackBy: ngForTrackById">{{item.name}}</li>
</ul>
```

#### `ngForTrackByProp`
A directive to track `ngFor` by property.

```html
<ul>
  <li *ngFor="let item of items; trackBy: ngForTrackByProp: 'id'">{{item.name}}</li>
</ul>
```
