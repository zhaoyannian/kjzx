import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SelectPersonPage } from './select-person';

@NgModule({
  declarations: [
    SelectPersonPage,
  ],
  imports: [
    IonicPageModule.forChild(SelectPersonPage),
  ],
})
export class SelectPersonPageModule {}
