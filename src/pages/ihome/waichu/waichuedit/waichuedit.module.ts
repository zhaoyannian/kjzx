import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WaichuEditPage } from './waichuedit';
import { ReactiveFormsModule } from '@angular/forms';
import { ComponentsModule } from '../../../../components/icomponents/components.module';


@NgModule({
  declarations: [
    WaichuEditPage,
  ],
  imports: [
    ReactiveFormsModule,//form表单
    ComponentsModule,
    IonicPageModule.forChild(WaichuEditPage),
  ],
})
export class WaichuEditModule {}
