import { NgModule } from '@angular/core';
import { TransactionItemComponent } from './transaction-item/transaction-item';
import { IonicModule } from "ionic-angular";
@NgModule({
  declarations: [TransactionItemComponent],
  imports: [IonicModule],
  exports: [TransactionItemComponent]
})
export class ComponentsModule { }
