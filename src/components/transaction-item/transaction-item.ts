import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
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

  @ViewChild(`item`) slider: ElementRef;

  constructor() {

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

  abs(x) {
    return Math.abs(x);
  }

  onDislike(item, e) {
    // console.log(`Item swiped`);
    item.setElementClass("remove-left", true);
    item.setElementClass("drag-right", false);
    item.setElementClass("drag-left", true);
    item.setElementClass("active-slide", true);
    item.setElementClass("active-options-right", true);
    setTimeout(() => {
      this.flagItem(item);
    }, 100);
  }

  onLike(item, e) {
    // console.log(`Item swiped`);
    this.onLikeAnim(item);
    console.log(item);
    // setTimeout(() => {
    //   this.approveItem(item);
    // }, 100);
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
