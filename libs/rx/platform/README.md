# @angular-kit/rx/platform

A set of reactive creation functions and directives wrapping browser APIs.

## 🔋 Included

### Wrapped Browser APIs

- `ResizeObserver` - wrapped by `createResizeObserver`
- `IntersectionObserver` - wrapped by `createIntersectionObserver`
- `MutationObserver` - wrapped by `createMutationObserver`

These API's are wrapped by creation-functions for a convenient Observable-creation as well as a set of 
Angular directives for a convenient usage in templates.

### Creation-functions

#### `createResizeObserver`
This creation function wraps the `ResizeObserver` API and returns an observable of `ResizeObserverEntry` objects.

*Signature*
```typescript
function createResizeObserver(
  observeElement: ElementRef | Element,
  cfg?: ResizeObserverConfig,
): Observable<ResizeObserverEntry[]>;
```

```ts
type ResizeObserverConfig = {
  /**throttle emissions, defaults to 50*/
  throttleMs?: number;
  /** scheduler to use for throttling */
  scheduler?: SchedulerLike;
};
```
- For `ResizeObserverEntry` see [MDN](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserverEntry)

---
#### `createIntersectionObserver`
This creation function wraps the `IntersectionObserver` API and returns an observable of `IntersectionObserverEntry` objects.

```ts
function createIntersectionObserver(
  observeElement: ElementRef | Element,
  options?: IntersectionObserverInit,
  cfg?: IntersectionObserverConfig
): Observable<IntersectionObserverEntry[]> 
```

```ts
type IntersectionObserverConfig = {
  /**throttle emissions, defaults to 50*/
  throttleMs?: number;
  /** scheduler to use for throttling */
  scheduler?: SchedulerLike;
}
```

- For `IntersectionObserverInit` see [MDN](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/IntersectionObserver)
- For `IntersectionObserverEntry` see [MDN](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserverEntry)
---

#### `createMutationObserver`
This creation function wraps the `MutationObserver` API and returns an observable of `MutationRecord` objects.

```ts
function createMutationObserver(
  observeElement: ElementRef | Element,
  options?: MutationObserverInit,
  cfg?: MutationObserverConfig
): Observable<MutationRecord[]>
```

```ts
export type MutationObserverConfig = {
  /**throttle emissions, defaults to 50*/
  throttleMs?: number;
  /** scheduler to use for throttling */
  scheduler?: SchedulerLike;
}
```

- For `MutationObserverInit` see [MDN](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserverInit)
- For `MutationRecord` see [MDN](https://developer.mozilla.org/en-US/docs/Web/API/MutationRecord)

### Directives

#### `rxObserveResize`
#### `rxObserveIntersection`
#### `rxObserveVisibility`
#### `rxRenderInViewport`
