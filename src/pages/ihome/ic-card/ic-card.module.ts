import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { IcCardPage } from './ic-card';

@NgModule({
  declarations: [
    IcCardPage,
  ],
  imports: [
    IonicPageModule.forChild(IcCardPage),
  ],
})
export class IcCardPageModule {}
