import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NetworkServicePage } from './network-service';
// import { fhqEditMxPage } from './service-draft/eidtDraftfhq';
// import { ServiceDraftPage } from './service-draft/service-draft';
// import { ServiceEditPage } from './service-edit/service-edit';
// import { SelectPersonPage } from './select-peoplenew/select-person';
// import { ComponentsModule } from './../../../components/icomponents/components.module';

@NgModule({
  declarations: [
    NetworkServicePage,
    // ServiceDraftPage,
    // fhqEditMxPage,
    // ServiceEditPage,
    // SelectPersonPage
  ],
  imports: [
    // ComponentsModule,
    IonicPageModule.forChild(NetworkServicePage)
  ],
  entryComponents: [
    NetworkServicePage,
    // ServiceDraftPage,
    // fhqEditMxPage,
    // ServiceEditPage,
    // SelectPersonPage
   
  ]
})
export class NetworkServicePageModule {}
