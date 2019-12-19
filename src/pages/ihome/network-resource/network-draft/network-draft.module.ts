import{ NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NetworkDraftPage } from './network-draft';

@NgModule({
    declarations:[
        NetworkDraftPage
    ],
    imports: [
        IonicPageModule.forChild(NetworkDraftPage)
    ]
})
export class NetworkDraftPageModule {}