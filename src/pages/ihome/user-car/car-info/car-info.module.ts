import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CarInfoPage } from './car-info';

@NgModule({
  declarations: [
    CarInfoPage,
  ],
  imports: [
    IonicPageModule.forChild(CarInfoPage),
  ],
})
export class CarInfoPageModule {}
