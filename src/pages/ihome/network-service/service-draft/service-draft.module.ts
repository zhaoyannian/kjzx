import{ NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ServiceDraftPage } from './service-draft';
// import { fhqEditMxPage } from './eidtDraftfhq';
import { ComponentsModule } from './../../../../components/icomponents/components.module';

@NgModule({
    declarations:[
        ServiceDraftPage,
        // fhqEditMxPage
    ],
    imports: [
        ComponentsModule,
        IonicPageModule.forChild(ServiceDraftPage)
    ],
    entryComponents: [
        ServiceDraftPage,
        // fhqEditMxPage
    ]
})
export class ServiceDraftPageModule {}