import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditProjectModalPage } from './edit-project-modal';

@NgModule({
  declarations: [
    EditProjectModalPage,
  ],
  imports: [
    IonicPageModule.forChild(EditProjectModalPage),
  ],
})
export class EditProjectModalPageModule {}
