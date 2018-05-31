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

  edit: boolean = false;

  constructor() {
  }

  ngAfterViewInit() {
    // console.log(`Transaction Item`);
    console.log(this._transaction);
  }

  approve() {
    this.onApprove.emit({
      transaction: this._transaction,
      point: 5,
    });
    // this.onApproveFlag.emit({
    //   transaction: this._transaction,
    //   point: 5
    // });
    this.edit = false;
  }

  flag() {
    this.onFlag.emit({
      transaction: this._transaction
    });
    this.edit = false;
  }

  abs(x) {
    return Math.abs(x);
  }

  private approveItem(item) {
    this.onApprove.emit({
      transaction: this._transaction,
      item: item
    });
  }

  private flagItem(item) {
    this.onFlag.emit({
      transaction: this._transaction,
      item: item
    });
  }

  onDislike(item, e) {
    // console.log(`Item swiped`);
    item.setElementClass("remove-left", true);
    item.setElementClass("drag-right", false);
    item.setElementClass("drag-left", true);
    item.setElementClass("active-slide", true);
    item.setElementClass("active-options-right", true);
    setTimeout(() => {
      this.flag();
    }, 100);
  }

  onLike(item, e) {
    // console.log(`Item swiped`);
    this.onLikeAnim(item);
    // console.log(item);
    setTimeout(() => {
      this.approve();
    }, 100);
  }

  onLikeAnim(item) {
    item.setElementClass("remove-right", true);
    item.setElementClass("drag-left", false);
    item.setElementClass("drag-right", true);
    item.setElementClass("active-slide", true);
    item.setElementClass("active-options-left", true);
  }

  onDrag(item, event) {
    let shift = event.getOpenAmount();
    // console.log(item);
    if (shift > 0) {
      item.setElementClass("drag-right", false);
      item.setElementClass("drag-left", true);
    } else {
      item.setElementClass("drag-left", false);
      item.setElementClass("drag-right", true);
    }
  }

  switchEdit() {
    this.edit = !this.edit;
  }
}
