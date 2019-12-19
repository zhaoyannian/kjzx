import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PurchaseflowPage } from './purchaseflow';
import { PurchaseSlide1Page } from './purchase-slide1/purchase-slide1';
import { PurchaseSlide2Page } from './purchase-slide2/purchase-slide2';
import { PurchaseSlide3Page } from './purchase-slide3/purchase-slide3';


@NgModule({
  declarations: [
    PurchaseflowPage,
    PurchaseSlide1Page,
    PurchaseSlide2Page,
    PurchaseSlide3Page


  ],
  imports: [
    IonicPageModule.forChild(PurchaseflowPage),
  ],
})
export class PurchaseflowPageModule { }
