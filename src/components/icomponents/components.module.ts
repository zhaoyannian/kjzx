import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import { TabSlideComponent } from './tab-slide/tab-slide';
import { WorkFlowComponent } from './work-flow/work-flow';
import { DatetimeComponent } from './datetime/datetime';
import { WorkflowButtonComponent } from './workflow-button/workflow-button';
import { WorkTab1Component } from './work-tab1/work-tab1';
import { WorkTab2Component } from './work-tab2/work-tab2';
import { WorkTab3Component } from './work-tab3/work-tab3';
import { PurchaseFlowComponent } from './purchase-flow/purchase-flow';
import { PurchaseButtonComponent } from './purchase-button/purchase-button';
@NgModule({
	declarations: [
		TabSlideComponent,
		WorkFlowComponent,
		DatetimeComponent,
		WorkflowButtonComponent,//按钮组件
		WorkTab1Component,
		WorkTab2Component,
		WorkTab3Component,
		PurchaseFlowComponent,
		PurchaseButtonComponent,//按钮组件

	],
	imports: [IonicModule],
	exports: [
		TabSlideComponent,
		WorkFlowComponent,
		DatetimeComponent,
		WorkflowButtonComponent,//按钮组件
		WorkTab1Component,
		WorkTab2Component,
		WorkTab3Component,
		PurchaseFlowComponent,
		PurchaseButtonComponent,//按钮组件
	]
})
export class ComponentsModule {}
