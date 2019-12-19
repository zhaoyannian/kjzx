import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MessagePublishPage } from './messagePublish';
import { EditorPage } from './editor/editor';

@NgModule({
  declarations: [
    MessagePublishPage,
    EditorPage
  ],
  imports: [
    IonicPageModule.forChild(MessagePublishPage),
  ],
  entryComponents: [
    MessagePublishPage,
    EditorPage
  ]
})
export class MessagePublishPageModule {}
