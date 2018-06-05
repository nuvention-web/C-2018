import { DetailPage } from './detail';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ComponentsModule } from "../../components/components.module";
@NgModule({
    declarations: [
        DetailPage,
    ],
    imports: [
        IonicPageModule.forChild(DetailPage),
    ],
})
export class DetailPageModule {}
