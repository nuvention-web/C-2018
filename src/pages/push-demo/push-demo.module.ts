import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PushDemoPage } from './push-demo';

@NgModule({
  declarations: [
    PushDemoPage,
  ],
  imports: [
    IonicPageModule.forChild(PushDemoPage),
  ],
})
export class PushDemoPageModule {}
