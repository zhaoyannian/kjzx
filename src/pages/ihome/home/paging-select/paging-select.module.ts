import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PagingSelectPage } from './paging-select';

@NgModule({
  declarations: [
    PagingSelectPage,
  ],
  imports: [
    IonicPageModule.forChild(PagingSelectPage),
  ],
})
export class PagingSelectPageModule {}
