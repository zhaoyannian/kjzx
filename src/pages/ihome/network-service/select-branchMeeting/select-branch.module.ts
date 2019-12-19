import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SelectBranchPage } from './select-branch';

@NgModule({
  declarations: [
    SelectBranchPage,
  ],
  imports: [
    IonicPageModule.forChild(SelectBranchPage),
  ],
})
export class SelectRoomPageModule {}
