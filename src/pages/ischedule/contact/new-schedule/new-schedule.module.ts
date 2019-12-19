import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NewSchedulePage } from './new-schedule';

@NgModule({
  declarations: [
    NewSchedulePage,
  ],
  imports: [
    IonicPageModule.forChild(NewSchedulePage),
  ],
})
export class NewSchedulePageModule {}
