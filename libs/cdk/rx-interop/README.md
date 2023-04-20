# @angular-kit/cdk/rx-interop

# 🔋 Included

* `effectOnChanges$`
* `OnChanges$`
* `useOnChanges$`
* `useOnChangesState$`
* `useFromEvent$`
* `useHostListener$`
* `useHostBinding`




#### `effectOnChanges$`

* ✅ Reduces your boilerplate code 
* ✅ Effect does not run on `undefined` values

##### 📖 Basic Usage

```ts
interface Inputs{
  foo: string;
  bar: string;
}
@Component({
  // ...
})
export class SomeComponent implements OnChanges{
    @Input() foo: string;
    @Input() bar: string;
 
  ngOnChanges(changes: TypedSimpleChanges<Inputs>){
    effectOnChanges$(changes, (change) => { 
      // do something with all changes
    })
     effectOnChanges$(changes, 'foo', (change) => {
      // do something with foo change
       // runs only when foo changes
     })
  }
  
}
```


#### `OnChanges$`
* ✅ Reduces your boilerplate code when dealing with `OnChanges` and `Input`-setter
* ✅ Does not run on `undefined` changes

##### 📖 Basic Usage

```ts

// ❌ change this 

export class SomeComponent{
  private foo$$ = new ReplaySubject<string>(1);
  private bar$$ = new ReplaySubject<string>(1);

  @Input() set foo(foo: string){
    this.foo$$.next(foo);
  }
   @Input() set bar(bar: string){
    this.bar$$.next(bar);
  }
  
  vm$ = combineLatest([this.foo$$, this.bar$$]).pipe(
    map(([foo, bar]) => ({foo, bar}))
  )
  
}

// ✅ into this
interface Inputs{
  foo: string;
  bar: string;
}
@Component({
  // ...
  providers: [provideOnChanges$()]
})
export class SomeComponent implements OnChanges{
  @Input() foo: string;
  @Input() bar: string;
  
  private onChangesHandler = injectOnChanges$()  
  ngOnChanges(changes: TypedSimpleChanges<Inputs>){
    this.onChangesHandler.connect$(changes)
  }
  
  vm$ = this.onChangesHandler.changesState$
  fooChange$ = this.onChangesHandler.changes$.pipe(map(change => change.foo))
}


```

#### `useOnChanges$`
`useOnChanges$` provides an easy way of leveraging `OnChanges` in an reactive way with RxJs.

##### 📖 Basic Usage

```ts

@Component({
  // ...
})
export class SomeComponent implements OnChanges {
  @Input() foo: string;
  @Input() bar: string;
  
  changes$ = useOnChanges$(this)
  fooChange$ = useOnChanges$(this, 'foo')
  barChange$ = this.changes$.pipe(map(change => change.bar))

  ngOnChanges() {
  }
}
```
> **Warning**
> Currently you can not use `useOnChanges$` and `effectOnChanges` as well as `OnChanges$` in the same
> component. 


#### `useOnChangesState$`
`useOnChangesState$` provides an easy way of leveraging `OnChanges` in an reactive way with RxJs. It will
emit the state of your component's changes.

##### 📖 Basic Usage
```ts

@Component({
  // ...
})
export class SomeComponent implements OnChanges {
  @Input() foo: string;
  @Input() bar: string;
  
  changes$ = useOnChangesState$(this)
  foo$ = useOnChanges$(this, 'foo')
  bar$ = this.changes$.pipe(map(change => change.bar))

  ngOnChanges() {
  }
}
```

> **Warning**
> Currently you can not use `useOnChangesState$` and `effectOnChanges` as well as `OnChanges$` in the same
> component.

#### `useFromEvent$`
* ✅ simplified usage of `fromEvent`
* ✅ Optimized change detection - runs outside of Angular's zone by default 

##### 📖 Basic Usage

```ts
  // in some component

@ViewChild('someElement') someElement: ElementRef;

someElementClick$ = useFromEvent$(this.someElement, 'click')

```


#### `useHostListener$`
* ✅ Optimized change detection - runs outside of Angular's zone by default

##### 📖 Basic Usage
```ts

@Component({
  // ...
})
export class SomeComponent {
    clicks$ = useHostListener$(this, 'click')
}
```



#### `useHostBinding`

##### 📖 Basic Usage
```ts

@Component({
  // ...,
  styles: [
    `
    .bg {
      background: red;
    }
  `,
  ],
})
export class SomeComponent {
  background = useHostBinding('bg', false);
  clicks$ = useHostListener$(this, 'click')
  
  constructor() {
    this.clicks$.subscribe(() => {
      this.background.set(!this.background.get())
    });
  }
  
}
```
