import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserCarPage } from './user-car';

@NgModule({
  declarations: [
    UserCarPage,
  ],
  imports: [
    IonicPageModule.forChild(UserCarPage),
  ],
})
export class UserCarPageModule {}
