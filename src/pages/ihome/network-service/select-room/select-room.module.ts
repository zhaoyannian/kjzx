import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SelectRoomPage } from './select-room';

@NgModule({
  declarations: [
    SelectRoomPage,
  ],
  imports: [
    IonicPageModule.forChild(SelectRoomPage),
  ],
})
export class SelectRoomPageModule {}
