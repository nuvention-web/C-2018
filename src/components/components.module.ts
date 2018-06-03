import { NgModule } from '@angular/core';
import { TransactionItemComponent } from './transaction-item/transaction-item';
import { IonicModule } from "ionic-angular";
import { ProgressbarComponent } from './progressbar/progressbar';
import { TransactionItem_2Component } from './transaction-item-2/transaction-item-2';
import { TransactionGroupComponent } from './transaction-group/transaction-group';
import { MenuComponent } from './menu/menu';
@NgModule({
  declarations: [TransactionItemComponent,
    ProgressbarComponent,
    TransactionItem_2Component,
    TransactionGroupComponent,
    TransactionItem_2Component,
    MenuComponent],
  imports: [IonicModule],
  exports: [TransactionItemComponent,
    ProgressbarComponent,
    TransactionItem_2Component,
    TransactionGroupComponent,
    TransactionItem_2Component,
    MenuComponent]
})
export class ComponentsModule { }
