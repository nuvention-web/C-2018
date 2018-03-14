import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DashboardPage } from './dashboard';
import { ComponentsModule } from "../../components/components.module";
import { NgProgressModule } from '@ngx-progressbar/core';

@NgModule({
  declarations: [
    DashboardPage,
  ],
  imports: [
    IonicPageModule.forChild(DashboardPage),
    ComponentsModule,
    NgProgressModule.forRoot()
  ],
})
export class DashboardPageModule { }
