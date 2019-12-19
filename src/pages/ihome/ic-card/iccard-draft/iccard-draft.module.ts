import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { IccardDraftPage } from './iccard-draft';

@NgModule({
    declarations: [
        IccardDraftPage,
    ],
    imports: [
      IonicPageModule.forChild(IccardDraftPage),
    ],
  })
  export class IccardDraftPageModule {}