import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LoginLogPage } from './login-log';

@NgModule({
  declarations: [
    LoginLogPage,
  ],
  imports: [
    IonicPageModule.forChild(LoginLogPage),
  ],
  exports: [
    LoginLogPage
  ]
})
export class LoginLogPageModule {}
