import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ENV } from '@env/environment';

@IonicPage()
@Component({
  selector: 'page-car-info',
  templateUrl: 'car-info.html',
})
export class CarInfoPage {
    entry:any = {};
    state: any = ENV.httpurl;
    constructor(public navCtrl: NavController, public navParams: NavParams){
        this.entry = this.navParams.get('entry');
    }
    goback(){
        this.navCtrl.pop();
      }
}