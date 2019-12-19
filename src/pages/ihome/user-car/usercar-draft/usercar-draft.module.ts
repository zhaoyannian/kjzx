import{ NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserCarDraftPage } from './usercar-draft';

@NgModule({
    declarations:[
        UserCarDraftPage
    ],
    imports: [
        IonicPageModule.forChild(UserCarDraftPage)
    ]
})
export class UserCarDraftPageModule {}