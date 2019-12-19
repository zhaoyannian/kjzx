import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EntrustApplyPage } from './entrustApply';
import { ComponentsModule } from '../../../../components/icomponents/components.module';
@NgModule({
  declarations: [
    EntrustApplyPage,
    
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(EntrustApplyPage),
  ],
})
export class EntrustApplyPageModule {}
