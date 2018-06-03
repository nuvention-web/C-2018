import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AppFramePage } from './app-frame';

@NgModule({
  declarations: [
    AppFramePage,
  ],
  imports: [
    IonicPageModule.forChild(AppFramePage),
  ],
})
export class AppFramePageModule {}
