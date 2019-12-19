import { Component ,Input} from '@angular/core';

/**
 * Generated class for the WorkFlowComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'work-flow',
  templateUrl: 'work-flow.html'
})
export class WorkFlowComponent {
  @Input() opinionList;
  @Input() points;
  collspaed:any = false;
  constructor() {
  }

}
