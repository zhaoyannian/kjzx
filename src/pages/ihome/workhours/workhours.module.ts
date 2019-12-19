import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WorkhoursPage } from './workhours';
import { WorkhoursEditPage } from './draft/editDraft';
import { WorkhoursEditMxPage } from './draft/eidtDraftMx';
import { ProjectPage } from './project/project';
import { fhqEditMxPage } from '../network-service/service-draft/eidtDraftfhq';

// import { Edit1Page } from '../network-service/workhours/edit1Draft';
// import { TabSlideComponent } from '../../components/tab-slide/tab-slide';
import { ComponentsModule } from './../../../components/icomponents/components.module';

@NgModule({
  declarations: [
    WorkhoursPage,
    WorkhoursEditMxPage,
    ProjectPage,
    WorkhoursEditPage,
    fhqEditMxPage
    // TabSlideComponent
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(WorkhoursPage)
  ],
  entryComponents: [
    WorkhoursPage,
    WorkhoursEditMxPage,
    ProjectPage,
    WorkhoursEditPage,
    fhqEditMxPage
  ]
})
export class WorkhoursPageModule {}
