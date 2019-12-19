import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GooutPage } from './goout';

@NgModule({
  declarations: [
    GooutPage
  ],
  imports: [
    IonicPageModule.forChild(GooutPage),
  ],
  entryComponents: [
    GooutPage
  ]
})
export class GooutPageModule {}
