import{ NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SelectDriverPage } from './select-driver';

@NgModule({
    declarations:[
        SelectDriverPage
    ],
    imports: [
        IonicPageModule.forChild(SelectDriverPage)
    ]
})
export class SelectDriverPageModule {}