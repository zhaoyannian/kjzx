import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GooutEditorPage } from './goout-editor';
import { ComponentsModule } from '../../../../components/icomponents/components.module';

@NgModule({
    declarations:[
        GooutEditorPage
    ],
    imports:[
        ComponentsModule,
        IonicPageModule.forChild(GooutEditorPage)
    ]
})
export class GooutEditorPageModule{}