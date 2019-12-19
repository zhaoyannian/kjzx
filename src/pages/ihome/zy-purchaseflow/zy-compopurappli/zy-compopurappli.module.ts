import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { ZyCompopurappliPage } from "./zy-compopurappli";
import { ComponentsModule } from "../../../../components/icomponents/components.module";

@NgModule({
  declarations: [ZyCompopurappliPage],
  imports: [ComponentsModule, IonicPageModule.forChild(ZyCompopurappliPage)]
})
export class ZyCompopurappliPageModule {}
