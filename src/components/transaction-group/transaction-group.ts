import { Component, Input, Output, EventEmitter } from '@angular/core';

/**
 * Generated class for the TransactionGroupComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'transaction-group',
  templateUrl: 'transaction-group.html'
})
export class TransactionGroupComponent {

  @Input(`transactions`) _transactions: any;
  @Output() onApprove: EventEmitter<any> = new EventEmitter();
  @Output() onApproveFlag: EventEmitter<any> = new EventEmitter();
  @Output() onFlag: EventEmitter<any> = new EventEmitter();

  constructor() {

  }

  private onApproveItem(ev) {
    this.onApprove.emit({
      group: this._transactions.data,
      transaction: ev.transaction,
      index: this._transactions.data.indexOf(ev.transaction),
      point: 5,
    });
    // this.onApproveFlag.emit({
    //   transaction: ev.transaction,,
    //   point: 5
    // });
  }

  private onFlagItem(ev) {
    this.onFlag.emit({
      group: this._transactions,
      transaction: ev.transaction,
      index: this._transactions.data.indexOf(ev.transaction)
    });
  }

  private approve() {
    this.onApprove.emit({
      group: this._transactions,
      point: 5,
    });
  }

}
