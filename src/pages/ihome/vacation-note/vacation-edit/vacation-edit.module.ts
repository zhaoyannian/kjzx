import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { VacationEditPage } from './vacation-edit';
import { ComponentsModule } from '../../../../components/icomponents/components.module';

@NgModule({
  declarations: [
    VacationEditPage,
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(VacationEditPage),
  ],
})
export class VacationEditPageModule {}
