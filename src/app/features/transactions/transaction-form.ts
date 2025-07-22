import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-transaction-form',
  imports: [],
  template: `
    <p>
      transaction-form works!
    </p>
  `,
  styles: ``
})
export class TransactionForm {
  @Output() formClose = new EventEmitter<void>();

}
