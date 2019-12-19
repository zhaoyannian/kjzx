import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PdfViewPage } from './pdf-view';

@NgModule({
  declarations: [
    PdfViewPage,
  ],
  imports: [
    IonicPageModule.forChild(PdfViewPage),
  ],
})
export class PdfViewPageModule {}
