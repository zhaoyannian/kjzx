import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SettingPage } from './setting';
import { ChangepwdPage } from './changepwd/changepwd';

@NgModule({
  declarations: [
    SettingPage,
    ChangepwdPage,
  ],
  imports: [
    IonicPageModule.forChild([SettingPage,ChangepwdPage]),
  ],
  entryComponents: [
    ChangepwdPage,
  ]
})
export class SettingPageModule {}
