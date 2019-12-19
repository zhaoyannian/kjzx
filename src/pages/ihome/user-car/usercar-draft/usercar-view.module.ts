import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserCarViewPage } from './usercar-view';

@NgModule({
  declarations: [
    UserCarViewPage,
  ],
  imports: [
    IonicPageModule.forChild(UserCarViewPage),
  ],
})
export class UserCarViewPageModule {}