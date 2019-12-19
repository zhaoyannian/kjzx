import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MattersEditPage } from './matters-edit';
import { ComponentsModule } from '../../../../components/icomponents/components.module';
@NgModule({
    declarations:[
        MattersEditPage
    ],
    imports:[
        ComponentsModule,
        IonicPageModule.forChild(MattersEditPage)
    ]
})
export class MattersEditPageModule{}