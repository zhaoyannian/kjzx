import { NgModule} from '@angular/core';
import { IonicPageModule} from 'ionic-angular';
import { NetworkEditPage } from './network-edit';
import { ComponentsModule} from '../../../../components/icomponents/components.module';

@NgModule({
    declarations:[
        NetworkEditPage
    ],
    imports: [
        ComponentsModule,
        IonicPageModule.forChild(NetworkEditPage)
    ]
})
export class NetworkEditPageModule{}