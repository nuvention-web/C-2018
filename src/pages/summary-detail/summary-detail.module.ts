import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SummaryDetailPage } from './summary-detail';
import { ComponentsModule } from "../../components/components.module";

@NgModule({
  declarations: [
    SummaryDetailPage,
  ],
  imports: [
    IonicPageModule.forChild(SummaryDetailPage),
    ComponentsModule
  ],
})
export class SummaryDetailPageModule { }
