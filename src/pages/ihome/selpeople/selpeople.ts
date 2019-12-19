import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';

/**
 * Generated class for the SelpeoplePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-selpeople',
  templateUrl: 'selpeople.html',
})
export class SelpeoplePage {
  result:any = [];//人员数组
  constructor(public navCtrl: NavController, public navParams: NavParams,private viewCtrl: ViewController) {
    let arr = this.navParams.get('list');
    for(let key in arr) {
      this.result.push(arr[key]);
    }
  }

  ionViewDidLoad() {
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  save() {
    let data:any = [];
    for(let i=0;i<this.result.length;i++) {
      if(this.result[i].checked) {
        data.push(this.result[i]);
      }
    }
    this.viewCtrl.dismiss(data);
  }

}
