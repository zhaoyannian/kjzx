import { NgModule} from '@angular/core';
import { IonicPageModule} from 'ionic-angular';
import { IccardEditPage } from './iccard-edit';
import { ComponentsModule} from '../../../../components/icomponents/components.module';

@NgModule({
    declarations:[
        IccardEditPage
    ],
    imports: [
        ComponentsModule,
        IonicPageModule.forChild(IccardEditPage)
    ]
})
export class IccardEditPageModule{}