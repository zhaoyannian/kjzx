import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CompopurappliPage } from './compopurappli';
import { ComponentsModule } from '../../../../components/icomponents/components.module';

@NgModule({
  declarations: [
    CompopurappliPage,
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(CompopurappliPage),
  ],
})
export class CompopurappliPageModule {}
