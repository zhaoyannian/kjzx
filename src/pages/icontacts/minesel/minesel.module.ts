import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MineselPage } from './minesel';

@NgModule({
  declarations: [
    MineselPage,
  ],
  imports: [
    IonicPageModule.forChild(MineselPage),
  ],
})
export class MineselPageModule {}
