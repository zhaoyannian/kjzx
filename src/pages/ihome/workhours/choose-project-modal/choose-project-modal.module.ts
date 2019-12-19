import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChooseProjectModalPage } from './choose-project-modal';

@NgModule({
  declarations: [
    ChooseProjectModalPage,
  ],
  imports: [
    IonicPageModule.forChild(ChooseProjectModalPage),
  ],
})
export class ChooseProjectModalPageModule {}
