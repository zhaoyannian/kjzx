import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { NativeService } from './../../../icommon/provider/native';
import { HttpClient } from '@angular/common/http'

/**
 * Generated class for the GooutPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-goout',
  templateUrl: 'goout.html',
})
export class GooutPage {

  constructor(public nativeService: NativeService, public navCtrl: NavController, public navParams: NavParams, public http: HttpClient) {
  }

  ionViewDidLoad() {
  }

}
