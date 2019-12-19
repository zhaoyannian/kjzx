import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EvectionEditorPage } from './evection-editor';
import { ComponentsModule } from '../../../../components/icomponents/components.module';
@NgModule({
    declarations:[
        EvectionEditorPage
    ],
    imports:[
        ComponentsModule,
        IonicPageModule.forChild(EvectionEditorPage)
    ]
})
export class EvectionEditorPageModule{}