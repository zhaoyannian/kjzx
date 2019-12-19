import { NgModule} from '@angular/core';
import { IonicPageModule} from 'ionic-angular';
import { SealEditPage } from './seal-edit';
import { ComponentsModule} from '../../../../components/icomponents/components.module';

@NgModule({
    declarations:[
        SealEditPage
    ],
    imports: [
        ComponentsModule,
        IonicPageModule.forChild(SealEditPage)
    ]
})
export class SealEditPageModule{}