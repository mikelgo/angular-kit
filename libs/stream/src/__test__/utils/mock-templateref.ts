import {ElementRef, EmbeddedViewRef, Injector, TemplateRef} from "@angular/core";

export class TestTemplateRef extends TemplateRef<any> {
  createEmbeddedView(context: any, injector: Injector | undefined): EmbeddedViewRef<any> {
    return {} as EmbeddedViewRef<any>
  }

  readonly elementRef: ElementRef = { } as ElementRef;

}
