import { NgModule } from '@angular/core';
import { TransactionItemComponent } from './transaction-item/transaction-item';
import { IonicModule } from "ionic-angular";
import { ProgressbarComponent } from './progressbar/progressbar';
import { TransactionItem_2Component } from './transaction-item-2/transaction-item-2';
@NgModule({
  declarations: [TransactionItemComponent,
    ProgressbarComponent,
    TransactionItem_2Component],
  imports: [IonicModule],
  exports: [TransactionItemComponent,
    ProgressbarComponent,
    TransactionItem_2Component]
})
export class ComponentsModule { }
