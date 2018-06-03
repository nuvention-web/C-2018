import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SummaryDetailPage } from './summary-detail';

@NgModule({
  declarations: [
    SummaryDetailPage,
  ],
  imports: [
    IonicPageModule.forChild(SummaryDetailPage),
  ],
})
export class SummaryDetailPageModule {}
