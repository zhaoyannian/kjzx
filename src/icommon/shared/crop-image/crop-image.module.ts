import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CropImagePage } from './crop-image';

@NgModule({
  declarations: [
    CropImagePage,
  ],
  imports: [
    IonicPageModule.forChild(CropImagePage),
  ],
  exports: [
    CropImagePage
  ]
})
export class CropImagePageModule {}
