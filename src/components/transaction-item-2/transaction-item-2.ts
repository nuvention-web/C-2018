import { Component, Input, Output, EventEmitter } from '@angular/core';

/**
 * Generated class for the TransactionItem_2Component component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'transaction-item-2',
  templateUrl: 'transaction-item-2.html'
})
export class TransactionItem_2Component {

  @Input(`data`) _transaction: any;
  @Input(`isInDetail`) _isInDetail: boolean;
  @Input(`isFlag`) _isFlag: boolean;
  @Output() onApprove: EventEmitter<any> = new EventEmitter();
  @Output() onApproveFlag: EventEmitter<any> = new EventEmitter();
  @Output() onFlag: EventEmitter<any> = new EventEmitter();

  constructor() {
  }

  ngAfterViewInit() {
    // console.log(`Transaction Item`);
    // console.log(this._transaction);
  }

  private approve() {
    this.onApprove.emit({
      transaction: this._transaction,
      point: 5,
    });
    this.onApproveFlag.emit({
      transaction: this._transaction,
      point: 5
    });
  }

  private flag() {
    this.onFlag.emit({
      transaction: this._transaction
    });
  }
}
