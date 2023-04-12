import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {StreamDirective} from './stream.directive';
import {STREAM_DIR_CONFIG, StreamDirectiveConfig} from "./stream-directive-config";

@NgModule({
  imports: [CommonModule],
  declarations: [StreamDirective],
  exports: [StreamDirective],
})
export class StreamDirectiveModule {
  static withConfig(config: StreamDirectiveConfig) {
    return {
      ngModule: StreamDirectiveModule,
      providers: [
        {
          provide: STREAM_DIR_CONFIG,
          useValue: config,
        },
      ],
    };
  }
}
