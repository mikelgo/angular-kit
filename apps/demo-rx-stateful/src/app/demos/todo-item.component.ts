import {Component, Input} from '@angular/core';
import {Todo} from "../types";
import {MatIconModule} from "@angular/material/icon";
import {NgIf} from "@angular/common";

@Component({
  standalone: true,
  imports: [ MatIconModule, NgIf],
  selector: 'todo-item',
  template: `
    <div class="flex gap-4 ">
      <div class="w-12">
        {{todo.id}}
      </div>
      <div class="w-12">
        <ng-container *ngIf="todo.completed; else openTpl">
          <mat-icon>check</mat-icon>
        </ng-container>
        <ng-template #openTpl>
          <mat-icon>close</mat-icon>
        </ng-template>
      </div>
      <div>
        {{todo.title}}
      </div>
    </div>
  `,
  styles: [`
    :host {
      display:block;
      padding: 32px 64px 32px 64px;
    }
  `],
})
export class TodoItemComponent {
  @Input({required: true}) todo!: Todo;
}
