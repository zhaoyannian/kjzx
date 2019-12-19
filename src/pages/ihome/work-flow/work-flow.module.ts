import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WorkFlowPage } from './work-flow';
// import { WorkFlowComponent } from '../../components/work-flow/work-flow';

@NgModule({
  declarations: [
    WorkFlowPage,
    // WorkFlowComponent
  ],
  imports: [
    IonicPageModule.forChild(WorkFlowPage),
  ],
})
export class WorkFlowPageModule {}
