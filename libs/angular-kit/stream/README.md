# @code-workers.io/angular-kit/stream

Secondary entry point of `@code-workers.io/angular-kit`. It can be used by importing from `@code-workers.io/angular-kit/stream`.

- ✅ Optimized change detection in comparison to `async` pipe
- ✅ Lazy by default
- ✅ Loading, error and complete states
- ✅ Easy customization via templates or components

## Usage

### Basic example

```html
<ng-container
  *stream="
    source$;
    let value;
    let error = error;
    let complete = completed;
    let loading = loading;
    loadingTemplate: loadingTemplate;
    errorTemplate: errorTemplate;
    completeTemplate: completeTemplate;
    keepValueOnLoading: true
  "
>
  {{ value }}
</ng-container>

<ng-template #loadingTemplate let-loading="loading">
  <my-spinner [loading]="loading"></my-spinner>
</ng-template>
<ng-template #errorTemplate let-error="error"> error context: {{ error }} </ng-template>
<ng-template #completeTemplate let-completed="completed"> completed context: {{ completed }} </ng-template>
```

```typescript
@Component({})
export class MyComponent {
  source$ = this.http.get('https://jsonplaceholder.typicode.com/posts/1');
}
```

### API

tbd

### Configuration

You can configure `stream` to use defined components for loading, error and complete states instead of passing templates.

```typescript
@NgModule({
  imports: [
    StreamModule.forRoot({
      loadingComponent: MyLoadingComponent,
      errorComponent: MyErrorComponent,
      completeComponent: MyCompleteComponent,
    }),
  ],
})
export class AppModule {}
```

In your custom components you have access to the context via `STREAM_DIR_CONTEXT` injection token.

```typescript
@Component({
  selector: 'my-loading',
  template: ` <div *ngIf="loading">Loading... {{ context.loading }}</div> `,
})
export class MyLoadingComponent {
  constructor(@Inject(STREAM_DIR_CONTEXT) public context: StreamDirectiveContext) {}
}
```

_Note_ When using components and passing templates, the templates will be used instead.

## Comparision of `async` pipe vs `*stream`

tbd