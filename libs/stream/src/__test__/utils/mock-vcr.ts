import {
  ComponentFactory,
  ComponentRef,
  ElementRef,
  EmbeddedViewRef,
  Injector,
  NgModuleRef,
  TemplateRef,
  ViewContainerRef,
  ViewRef
} from "@angular/core";

export class TestViewContainerRef extends ViewContainerRef {
  // @ts-ignore
  createEmbeddedView<C>(templateRef: TemplateRef<C>, context?: C, index?: number): EmbeddedViewRef<C> {
    return {} as EmbeddedViewRef<C>;
  }

  clear(): void {}

  get(index: number): ViewRef | null {
    return null;
  }

  get length(): number {
    return 0;
  }

  get element(): ElementRef<any> {
    return {} as ElementRef<any>;
  }

  get injector(): Injector {
    return {} as Injector;
  }

  get parentInjector(): Injector {
    return {} as Injector;
  }

  get destroyed(): boolean {
    return false;
  }

  destroy(): void {}

  onDestroy(callback: Function): void {}

  // @ts-ignore
  createComponent<C>(componentFactory: ComponentFactory<C>, index?: number, injector?: Injector, projectableNodes?: any[][], ngModule?: NgModuleRef<any>): ComponentRef<C> {
    return {} as unknown as ComponentRef<C>;
  }

  insert(viewRef: ViewRef, index?: number): ViewRef {
    return {} as ViewRef;
  }

  move(viewRef: ViewRef, currentIndex: number): ViewRef {
    return {} as ViewRef;
  }

  indexOf(viewRef: ViewRef): number {
    return 0;
  }

  remove(index?: number): void {}

  detach(index?: number): ViewRef | null {
    return null;
  }
}
