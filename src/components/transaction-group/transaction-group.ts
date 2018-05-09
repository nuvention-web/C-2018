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
  @Output() onApproveGroup: EventEmitter<any> = new EventEmitter();
  @Output() onFlag: EventEmitter<any> = new EventEmitter();

  constructor() {

  }

  onApproveItem(ev) {
    this.onApprove.emit({
      group: this._transactions,
      transaction: ev.transaction,
      index: this._transactions.data.indexOf(ev.transaction),
      point: 5,
      item: ev.item
    });
    // this.onApproveFlag.emit({
    //   transaction: ev.transaction,,
    //   point: 5
    // });
  }

  onFlagItem(ev) {
    this.onFlag.emit({
      group: this._transactions,
      transaction: ev.transaction,
      index: this._transactions.data.indexOf(ev.transaction),
      item: ev.item
    });
  }

  approve() {
    this.onApprove.emit({
      group: this._transactions,
      point: 5,
    });
  }

}
