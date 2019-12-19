import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { VacationNotePage } from './vacation-note';

@NgModule({
  declarations: [
    VacationNotePage,
  ],
  imports: [
    IonicPageModule.forChild(VacationNotePage),
  ],
})
export class VacationNotePageModule {}
