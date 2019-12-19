import { Component } from '@angular/core';

/**
 * Generated class for the DatetimeComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'datetime',
  templateUrl: 'datetime.html'
})
export class DatetimeComponent {

  text: string;

  constructor() {
    console.log('Hello DatetimeComponent Component');
    this.text = 'Hello World';
  }

}
