import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PurchasefloweditorPage } from './purchasefloweditor';
import { ComponentsModule } from '../../../../components/icomponents/components.module';
@NgModule({
  declarations: [
    PurchasefloweditorPage,
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(PurchasefloweditorPage),
  ],
})
export class PurchasefloweditorPageModule {}
