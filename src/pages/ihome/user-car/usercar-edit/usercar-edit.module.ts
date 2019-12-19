import{ NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserCarEditPage } from './usercar-edit';
import { ComponentsModule } from '../../../../components/icomponents/components.module';

@NgModule({
    declarations:[
        UserCarEditPage
    ],
    imports: [
        ComponentsModule,
        IonicPageModule.forChild(UserCarEditPage)
    ]
})
export class UserCarEditPageModule {}