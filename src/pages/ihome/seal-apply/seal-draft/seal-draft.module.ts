import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SealDraftPage } from './seal-draft';

@NgModule({
    declarations: [
        SealDraftPage,
    ],
    imports: [
      IonicPageModule.forChild(SealDraftPage),
    ],
  })
  export class SealDraftPageModule {}