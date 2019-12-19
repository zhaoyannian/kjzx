import { Component } from '@angular/core';
import { IonicPage, NavParams, ViewController,NavController } from 'ionic-angular';
import { ENV } from '@env/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { NativeService } from '../../../icommon/provider/native';

/**
 * Generated class for the MineviewPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-mineview',
  templateUrl: 'mineview.html',
})
export class MineviewPage {
  model:any = [];
  httpurl: any = ENV.httpurl;
  constructor(public navCtrl: NavController,public viewCtrl: ViewController, public navParams: NavParams,private sanitizer:DomSanitizer,
    private nat:NativeService) {
    if(navParams.get('info')) {
      this.model = this.navParams.get('info');
      // if(!!this.model.photo) {
      //   this.model.photo = ENV.httpurl + '/base/fileinfo/getFileImage?id=' + this.model.photo;
      // }else {
      //   this.model.photo = 'assets/imgs/people-head.png';
      // }
    }
  }

  ionViewDidLoad() {
  }
  goback(){
    this.navCtrl.pop();
  }
  dismiss() {
    this.viewCtrl.dismiss();
  }

  public sanitize():any {
    if(this.nat.isMobile) {
      return this.sanitizer.bypassSecurityTrustUrl('sms:' + this.model.mobile);
    }else {
      return false;
    }
  }
}
