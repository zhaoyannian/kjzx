import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InstrumentPage } from './instrument';
import { ComponentsModule } from '../../../../components/icomponents/components.module';
@NgModule({
  declarations: [
    InstrumentPage,
    
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(InstrumentPage),
  ],
})
export class InstrumentPageModule {}
