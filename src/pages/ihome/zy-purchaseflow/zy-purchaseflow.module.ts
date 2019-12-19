import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { ZyPurchaseflowPage } from "./zy-purchaseflow";
import { ZyPurchaseSlide1Page } from "./zy-purchase-slide1/zy-purchase-slide1";
import { ZyPurchaseSlide2Page } from "./zy-purchase-slide2/zy-purchase-slide2";
import { ZyPurchaseSlide3Page } from "./zy-purchase-slide3/zy-purchase-slide3";

@NgModule({
  declarations: [
    ZyPurchaseflowPage,
    ZyPurchaseSlide1Page,
    ZyPurchaseSlide2Page,
    ZyPurchaseSlide3Page
  ],
  imports: [IonicPageModule.forChild(ZyPurchaseflowPage)]
})
export class ZyPurchaseflowPageModule {}
