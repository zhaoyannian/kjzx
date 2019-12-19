import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ReagentsupplyPage } from './reagentsupply';
import { ComponentsModule } from '../../../../components/icomponents/components.module';

@NgModule({
  declarations: [
    ReagentsupplyPage,
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(ReagentsupplyPage),
  ],
})
export class ReagentsupplyPageModule {}
