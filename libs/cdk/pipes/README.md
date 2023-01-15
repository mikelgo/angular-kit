# @angular-kit/cdk/pipes

Collection of powerful pipes for Angular.

## 🔋Included pipes 

#### `RunFnPipe`
This pipe will run any function of your component and 
make use of Angular's memoization to prevent unnecessary
re-evaluations which will result in less change detection cycles.

Example
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
  
  sum(a: number, b: number) {
    return a + b;
  }
}
```
