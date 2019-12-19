import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SelpeoplePage } from './selpeople';

@NgModule({
  declarations: [
    SelpeoplePage,
  ],
  imports: [
    IonicPageModule.forChild(SelpeoplePage),
  ],
})
export class SelpeoplePageModule {}
