import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { LoginPage } from '../login/login';

/**
 * Generated class for the WelcomePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-welcome',
  templateUrl: 'welcome.html',
})
export class WelcomePage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {

  }

  ionViewDidLoad() {
  }

  goHome() {
    this.navCtrl.setRoot(LoginPage);
  }

}
