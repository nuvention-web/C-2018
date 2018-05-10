import { Component, Input, Output, EventEmitter, ViewChildren, QueryList } from '@angular/core';
import { TransactionItemComponent } from '../transaction-item/transaction-item';

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

  @ViewChildren(TransactionItemComponent) transactions: QueryList<TransactionItemComponent>;

  closed = false;

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
    let delay = 0;
    this.transactions.toArray().forEach(t => {
      delay += 100;
      setTimeout(() => t.onLikeAnim(t.slider), delay);
    });
    delay += 100;
    setTimeout(() => {
      this.closed = true;
      this.onApprove.emit({
        group: this._transactions,
        point: 5,
      });
    }, delay);
    // console.log();
  }

  onLike(item, e) {
    // console.log(`Item swiped`);
    item.setElementClass("remove-right", true);
    item.setElementClass("drag-left", false);
    item.setElementClass("drag-right", true);
    item.setElementClass("active-slide", true);
    item.setElementClass("active-options-left", true);
    setTimeout(() => {
      this.approve();
    }, 100);
  }

}
