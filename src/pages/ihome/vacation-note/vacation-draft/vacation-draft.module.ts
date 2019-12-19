import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { VacationDraftPage } from './vacation-draft';

@NgModule({
  declarations: [
    VacationDraftPage,
  ],
  imports: [
    IonicPageModule.forChild(VacationDraftPage),
  ],
})
export class VacationDraftPageModule {}
