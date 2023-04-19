import {ElementRef, inject, Renderer2} from "@angular/core";

/**
 * @publicApi
 *
 * @description
 * Use this function to create a host binding that can be used in a component.
 *
 * @example
 *
 * const disabled = useHostBinding$('disabled', false);
 * // somewhere in the component
 * disabled.set(true);
 *
 * @param className
 * @param enabledByDefault
 */
export function useHostBinding(className: string, enabledByDefault: boolean) {
  const renderer2 = inject(Renderer2);
  const {nativeElement} = inject(ElementRef)

  let value = enabledByDefault;


  if (value) {
    renderer2.addClass(nativeElement, className);
  }

  return {
    /**
     * Set the value of the host binding
     * @param newValue
     */
    set(newValue: boolean) {
      value = newValue;

      if (value) {
        renderer2.addClass(nativeElement, className);
      } else {
        renderer2.removeClass(nativeElement, className);
      }

    },

    /**
     * Get the value of the host binding
     */
    get() {
      return value;
    }

  }
}
