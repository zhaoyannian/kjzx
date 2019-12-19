import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SwiperSliderPage } from './swiper-slider';
// import { WorkhoursPage } from '../workhours/workhours'
import { ComponentsModule } from '../../../components/icomponents/components.module';

@NgModule({
  declarations: [
    SwiperSliderPage,
    // WorkhoursPage
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(SwiperSliderPage),
  ],
})
export class SwiperSliderPageModule {}
