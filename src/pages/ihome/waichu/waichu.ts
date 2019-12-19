import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the WaichuPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-waichu',
  templateUrl: 'waichu.html',
})
export class WaichuPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
  }

  /**
   * 新增
   */
  addWorkhoursFn() {
    this.navCtrl.push('WaichuEditPage');
  }

}
