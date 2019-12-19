import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { LoginPage } from '../../login/login';
/**
 * Generated class for the Forgetpwd3Page page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-forgetpwd3',
  templateUrl: 'forgetpwd3.html',
})
export class Forgetpwd3Page {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad Forgetpwd3Page');
  }
  goback(){
    this.navCtrl.pop();
  }
  login(){
    // this.navCtrl.popToRoot()
    this.navCtrl.setRoot(LoginPage);
  }

}
