import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TransDetailPage } from './trans-detail';

@NgModule({
  declarations: [
    TransDetailPage,
  ],
  imports: [
    IonicPageModule.forChild(TransDetailPage),
  ],
})
export class TransDetailPageModule {}
