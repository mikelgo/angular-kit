import {Directive, Host, NgModule} from '@angular/core';
import {CommonModule, NgForOf} from '@angular/common';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[ngForTrackById]',
})
export class TrackByIdDirective<T extends {id: unknown}> {

  constructor(@Host() private ngFor: NgForOf<T>) {
    if (!ngFor){
      throw new Error('ngForTrackById must be used with ngFor');
    }
    this.ngFor.ngForTrackBy = (index: number, item: T) => item.id;
  }
}

@NgModule({
  imports: [CommonModule],
  declarations: [TrackByIdDirective],
  exports: [TrackByIdDirective],
})
export class TrackByIdDirectiveModule {}
