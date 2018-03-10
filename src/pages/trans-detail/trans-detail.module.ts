import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TransDetailPage } from './trans-detail';
import { ComponentsModule } from "../../components/components.module";

@NgModule({
  declarations: [
    TransDetailPage,
  ],
  imports: [
    IonicPageModule.forChild(TransDetailPage),
    ComponentsModule
  ],
})
export class TransDetailPageModule { }
