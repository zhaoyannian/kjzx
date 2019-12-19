import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NetworkResourcePage } from './network-resource';

@NgModule({
  declarations: [
    NetworkResourcePage,
  ],
  imports: [
    IonicPageModule.forChild(NetworkResourcePage),
  ],
})
export class NetworkResourcePageModule {}
