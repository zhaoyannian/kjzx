import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MineviewPage } from './mineview';

@NgModule({
  declarations: [
    MineviewPage,
  ],
  imports: [
    IonicPageModule.forChild(MineviewPage),
  ],
})
export class MineviewPageModule {}
