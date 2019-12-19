import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,ViewController } from 'ionic-angular';
import {DomSanitizer} from '@angular/platform-browser';  

/**
 * Generated class for the PdfViewPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-pdf-view',
  templateUrl: 'pdf-view.html',
})
export class PdfViewPage {
  printViewSrc:any;
  constructor(private viewCtrl: ViewController,public navCtrl: NavController, public navParams: NavParams,private sanitizer: DomSanitizer) {
    let myurl = this.navParams.get('options');
    this.printViewSrc = this.sanitizer.bypassSecurityTrustResourceUrl(myurl); 
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PdfViewPage');
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }
}
