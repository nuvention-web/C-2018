import { Component, Input } from '@angular/core';

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

  constructor() {

  }

}
