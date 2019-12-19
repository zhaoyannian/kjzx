import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InforEditPage } from './infor-edit';

@NgModule({
  declarations: [
    InforEditPage,
  ],
  imports: [
    IonicPageModule.forChild(InforEditPage),
  ],
})
export class InforEditPageModule {}
