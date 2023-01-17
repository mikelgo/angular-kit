import {inject, InjectionToken} from '@angular/core';
import {DOCUMENT} from '@angular/common';

export const WINDOW = new InjectionToken<Window>('Browser window object', {
  providedIn: 'root',
  factory: () => {
    const { defaultView } = inject(DOCUMENT);
    if(!defaultView){
      throw new Error('Window is only available in browser environment');
    }

    return defaultView as Window;
  },
});
