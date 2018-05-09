import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ItemSliding } from 'ionic-angular';

/**
 * Generated class for the TransactionItemComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'transaction-item',
  templateUrl: 'transaction-item.html'
})
export class TransactionItemComponent {

  @Input(`data`) _transaction: any;
  @Input(`isInDetail`) _isInDetail: boolean;
  @Input(`isFlag`) _isFlag: boolean;
  @Output() onApprove: EventEmitter<any> = new EventEmitter();
  @Output() onApproveFlag: EventEmitter<any> = new EventEmitter();
  @Output() onFlag: EventEmitter<any> = new EventEmitter();

  constructor() {

  }

  approve(item) {
    this.onApprove.emit({
      transaction: this._transaction,
      item: item
    });
    // console.log(`APPROVE!!`);
  }

  flag(item) {
    this.onFlag.emit({
      transaction: this._transaction,
      item: item
    });
    // console.log(`FLAG!!`);
  }

  abs(x) {
    return Math.abs(x);
  }

  onDislikeSwipe(item, e) {
    // console.log(`Item swiped`);
    item.setElementClass("remove-left", true);
    setTimeout(() => {
      this.flag(item);
    }, 100);
  }

  onLikeSwipe(item, e) {
    console.log(`Item swiped`);
    item.setElementClass("remove-right", true);
    setTimeout(() => {
      this.approve(item);
    }, 100);
  }

  onDrag(item, event) {
    let shift = event.getOpenAmount();
    // console.log(shift);
    if (shift > 0) {
      item.setElementClass("drag-right", false);
      item.setElementClass("drag-left", true);
    } else {
      item.setElementClass("drag-left", false);
      item.setElementClass("drag-right", true);
    }
  }

}
