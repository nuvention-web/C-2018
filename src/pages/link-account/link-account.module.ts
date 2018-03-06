import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LinkAccountPage } from './link-account';
import { ComponentsModule } from "../../components/components.module";

@NgModule({
  declarations: [
    LinkAccountPage,
  ],
  imports: [
    IonicPageModule.forChild(LinkAccountPage),
    ComponentsModule
  ],
})
export class LinkAccountPageModule { }
