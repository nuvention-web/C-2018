import { NgModule } from '@angular/core';
import { TransactionItemComponent } from './transaction-item/transaction-item';
import { IonicModule } from "ionic-angular";
import { ProgressbarComponent } from './progressbar/progressbar';
import { TransactionItem_2Component } from './transaction-item-2/transaction-item-2';
import { TransactionGroupComponent } from './transaction-group/transaction-group';
@NgModule({
  declarations: [TransactionItemComponent,
    ProgressbarComponent,
    TransactionItem_2Component,
    TransactionGroupComponent],
  imports: [IonicModule],
  exports: [TransactionItemComponent,
    ProgressbarComponent,
    TransactionItem_2Component,
    TransactionGroupComponent]
})
export class ComponentsModule { }
