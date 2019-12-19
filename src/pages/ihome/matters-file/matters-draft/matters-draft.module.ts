import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MattersDraftPage } from './matters-draft';

@NgModule({
    declarations: [
        MattersDraftPage,
    ],
    imports: [
      IonicPageModule.forChild(MattersDraftPage),
    ],
  })
  export class MattersDraftPageModule {}