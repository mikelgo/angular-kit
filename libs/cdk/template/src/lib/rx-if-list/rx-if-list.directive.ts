import {
  Directive,
  EmbeddedViewRef,
  Input,
  NgModule,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
  ɵstringify as stringify
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {distinctUntilChanged, mergeAll, Observable, ReplaySubject, Subscription} from "rxjs";
import {coerceObservable} from "@angular-kit/cdk/coercing";

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[rxIfList]',
})
export class RxIfListDirective implements OnDestroy{
  private readonly sub = new Subscription();
  private readonly valueSource$$ = new ReplaySubject<Observable<ArrayLike<unknown> | null | undefined> >(1);
  private _context: RxIfListContext = new RxIfListContext();
  private _thenTemplateRef: TemplateRef<RxIfListContext>|null = null;
  private _elseTemplateRef: TemplateRef<RxIfListContext>|null = null;
  private _thenViewRef: EmbeddedViewRef<RxIfListContext>|null = null;
  private _elseViewRef: EmbeddedViewRef<RxIfListContext>|null = null;
  /** @internal */
  static rxIfListUseIfTypeGuard: void;

  /**
   * Assert the correct type of the expression bound to the `rxIfList` input within the template.
   *
   * The presence of this static field is a signal to the Ivy template type check compiler that
   * when the `rxIfList` structural directive renders its template, the type of the expression bound
   * to `rxIfList` should be narrowed in some way. For `rxIfList`, the binding expression itself is used to
   * narrow its type, which allows the strictNullChecks feature of TypeScript to work with `rxIfList`.
   */
  static ngTemplateGuard_rxIfList: 'binding';

  /**
   * Asserts the correct type of the context for the template that `rxIfList` will render.
   *
   * The presence of this method is a signal to the Ivy template type-check compiler that the
   * `rxIfList` structural directive renders its template with a specific context type.
   */
  static ngTemplateContextGuard<T>(dir: RxIfListDirective, ctx: any):
    ctx is RxIfListContext{
    return true;
  }

  constructor(private _viewContainer: ViewContainerRef, templateRef: TemplateRef<RxIfListContext>) {
    this._thenTemplateRef = templateRef;
    this.sub.add(
      this.valueSource$$.asObservable().pipe(
        distinctUntilChanged(),
        mergeAll(),
        distinctUntilChanged()
      ).subscribe(value => {
        this._context.$implicit = this._context.rxIfList = value;
        this._updateView(this._context);
      })
    )
  }
  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  /**
   * The Boolean expression to evaluate as the condition for showing a template.
   */
  @Input()
  set rxIfList(value: ArrayLike<unknown> | Observable<ArrayLike<unknown>> | null | undefined) {
    this.valueSource$$.next(coerceObservable(value));
  }

  /**
   * A template to show if the condition expression evaluates to true.
   */
  @Input()
  set rxIfListThen(templateRef: TemplateRef<RxIfListContext>|null) {
    assertTemplate('rxIfListThen', templateRef);
    this._thenTemplateRef = templateRef;
    this._thenViewRef = null;  // clear previous view if any.
    this._updateView(this._context);
  }

  /**
   * A template to show if the condition expression evaluates to false.
   */
  @Input()
  set rxIfListElse(templateRef: TemplateRef<RxIfListContext>|null) {
    assertTemplate('rxIfListElse', templateRef);
    this._elseTemplateRef = templateRef;
    this._elseViewRef = null;  // clear previous view if any.
    this._updateView(this._context);
  }

  private _updateView(ctx: RxIfListContext) {
    if (ctx.$implicit && (((ctx.$implicit as ArrayLike<any>)?.length ?? []) > 0)){
      if (!this._thenViewRef) {
        this._viewContainer.clear();
        this._elseViewRef = null;
        if (this._thenTemplateRef) {
          this._thenViewRef =
            this._viewContainer.createEmbeddedView(this._thenTemplateRef, ctx);
        }
      }
    }  else {
      if (!this._elseViewRef) {
        this._viewContainer.clear();
        this._thenViewRef = null;
        if (this._elseTemplateRef) {
          this._elseViewRef =
            this._viewContainer.createEmbeddedView(this._elseTemplateRef, ctx);
        }
      }
    }
  }


}

/**
 * @publicApi
 */
export class RxIfListContext {
   $implicit: ArrayLike<any> | null | undefined = null;
   rxIfList: ArrayLike<any> | null | undefined = null;
}

function assertTemplate(property: string, templateRef: TemplateRef<any>|null): void {
  const isTemplateRefOrNull = !!(!templateRef || templateRef.createEmbeddedView);
  if (!isTemplateRefOrNull) {
    throw new Error(`${property} must be a TemplateRef, but received '${stringify(templateRef)}'.`);
  }
}

@NgModule({
  imports: [CommonModule],
  declarations: [RxIfListDirective],
  exports: [RxIfListDirective],
})
export class RxIfListDirectiveModule {}
