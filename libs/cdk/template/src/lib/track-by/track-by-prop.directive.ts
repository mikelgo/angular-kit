import {Directive, Host, Input} from '@angular/core';
import {NgForOf} from '@angular/common';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[ngForTrackByProp]',
  standalone: true
})
export class TrackByPropDirective<T> {
  @Input() ngForTrackByProp!: keyof T;

  constructor(@Host() private ngFor: NgForOf<T>) {
    if (!ngFor){
      throw new Error('ngForTrackByProp must be used with ngFor');
    }

    this.ngFor.ngForTrackBy = (index: number, item: T) =>
      item[this.ngForTrackByProp];
  }
}

