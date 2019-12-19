import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WaichuPage } from './waichu';
import { WaichuEditModule } from './waichuedit/waichuedit.module';

@NgModule({
  declarations: [
    WaichuPage,
  ],
  imports: [
    WaichuEditModule,
    IonicPageModule.forChild(WaichuPage),
  ],
})
export class WaichuPageModule {}
