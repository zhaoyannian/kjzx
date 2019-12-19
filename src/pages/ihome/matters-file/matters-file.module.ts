import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MattersFilePage } from './matters-file';

@NgModule({
  declarations: [
    MattersFilePage,
  ],
  imports: [
    IonicPageModule.forChild(MattersFilePage),
  ],
})
export class MattersFilePageModule {}
