import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {StreamDirective} from './stream.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [StreamDirective],
  exports: [StreamDirective],
})
export class StreamDirectiveModule {}
