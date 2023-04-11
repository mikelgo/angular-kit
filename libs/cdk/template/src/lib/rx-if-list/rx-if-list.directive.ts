import {
  Directive,
  EmbeddedViewRef,
  Input,
  NgModule,
  TemplateRef,
  ViewContainerRef,
  ɵstringify as stringify
} from '@angular/core';
import {CommonModule} from '@angular/common';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[rxIfList]',
})
export class RxIfListDirective {
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
  }

  /**
   * The Boolean expression to evaluate as the condition for showing a template.
   */
  @Input()
  set rxIfList(value: ArrayLike<unknown> | null | undefined) {
    this._context.$implicit = this._context.rxIfList = ((value?.length ?? []) > 0);
    this._updateView();
  }

  /**
   * A template to show if the condition expression evaluates to true.
   */
  @Input()
  set rxIfListThen(templateRef: TemplateRef<RxIfListContext>|null) {
    assertTemplate('rxIfListThen', templateRef);
    this._thenTemplateRef = templateRef;
    this._thenViewRef = null;  // clear previous view if any.
    this._updateView();
  }

  /**
   * A template to show if the condition expression evaluates to false.
   */
  @Input()
  set rxIfListElse(templateRef: TemplateRef<RxIfListContext>|null) {
    assertTemplate('rxIfListElse', templateRef);
    this._elseTemplateRef = templateRef;
    this._elseViewRef = null;  // clear previous view if any.
    this._updateView();
  }

  private _updateView() {
    if (this._context.$implicit) {
      if (!this._thenViewRef) {
        this._viewContainer.clear();
        this._elseViewRef = null;
        if (this._thenTemplateRef) {
          this._thenViewRef =
            this._viewContainer.createEmbeddedView(this._thenTemplateRef, this._context);
        }
      }
    } else {
      if (!this._elseViewRef) {
        this._viewContainer.clear();
        this._thenViewRef = null;
        if (this._elseTemplateRef) {
          this._elseViewRef =
            this._viewContainer.createEmbeddedView(this._elseTemplateRef, this._context);
        }
      }
    }
  }


}

/**
 * @publicApi
 */
export class RxIfListContext {
   $implicit = false;
   rxIfList = false;
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
