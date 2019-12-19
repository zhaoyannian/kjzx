import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SelectPeoplePage } from './select-people';

@NgModule({
  declarations: [
    SelectPeoplePage,
  ],
  imports: [
    IonicPageModule.forChild(SelectPeoplePage),
  ],
})
export class SelectPeoplePageModule {}
