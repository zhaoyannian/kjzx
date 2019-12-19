import { NgModule} from '@angular/core';
import { IonicPageModule} from 'ionic-angular';
import { ServiceEditPage } from './service-edit';
import { ComponentsModule} from '../../../../components/icomponents/components.module';

@NgModule({
    declarations:[
        ServiceEditPage
    ],
    imports: [
        ComponentsModule,
        IonicPageModule.forChild(ServiceEditPage)
    ]
})
export class ServiceEditPageModule{}