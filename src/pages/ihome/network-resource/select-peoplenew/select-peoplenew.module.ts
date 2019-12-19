import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SelectPeopleNewPage } from './select-peoplenew';

@NgModule({
  declarations: [
    SelectPeopleNewPage,
  ],
  imports: [
    IonicPageModule.forChild(SelectPeopleNewPage),
  ],
})
export class SelectPeopleNewPageModule {}
