import { Component ,Input} from '@angular/core';

/**
 * Generated class for the PurchaseFlowComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'purchase-flow',
  templateUrl: 'purchase-flow.html'
})
export class PurchaseFlowComponent {
  @Input() opinionList;
  text: string;

  constructor() {
    this.text = 'Hello World';
  }

}
