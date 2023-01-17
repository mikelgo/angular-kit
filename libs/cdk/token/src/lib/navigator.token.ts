import {inject, InjectionToken} from "@angular/core";
import {WINDOW} from "./window.token";


export const NAVIGATOR = new InjectionToken<Navigator>('Browser navigator object', {
  providedIn: 'root',
  factory: () => inject(WINDOW)?.navigator
})
