import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SchedulePage } from './newSchedule';

@NgModule({
  declarations: [
    SchedulePage,
  ],
  imports: [
    IonicPageModule.forChild(SchedulePage),
  ],
})
export class SchedulePageModule {}
