import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ReagentsupplymasterPage } from './reagentsupplymaster';
import { ComponentsModule } from '../../../../components/icomponents/components.module';

@NgModule({
  declarations: [
    ReagentsupplymasterPage,
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(ReagentsupplymasterPage),
  ],
})
export class ReagentsupplymasterPageModule {}
