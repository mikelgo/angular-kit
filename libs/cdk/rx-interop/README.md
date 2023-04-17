# @angular-kit/cdk/rx-interop

# 🔋 Included

* `effectOnChanges$`
* `OnChanges$`


#### `effectOnChanges$`

* ✅ Reduces your boilerplate code 
* ✅ Effect do not run on `undefined` values

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
  private onChangesHandler = injectOnChanges$()  
  ngOnChanges(changes: TypedSimpleChanges<Inputs>){
    this.onChangesHandler.connect$(changes)
  }
  
  vm$ = this.onChangesHandler.changesState$
  fooChange$ = this.onChangesHandler.changes$.pipe(map(change => change.foo))
}


```
