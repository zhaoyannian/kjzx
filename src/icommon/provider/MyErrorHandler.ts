import {ErrorHandler, Injectable} from "@angular/core";
import {Events} from "ionic-angular";
import { LoginPage } from "../../pages/login/login";
import { NavController, App } from 'ionic-angular';


@Injectable()
export class MyErrorHandler implements ErrorHandler {

  constructor(private events: Events,public appCtrl : App) {
  }

  handleError(err: any): void {
    if(!!err) {
      console.log(err)
      // this.getNavCtrl();
      // setTimeout(() => this.navCtrl.push(LoginPage));
    }
    if (err.status === 401) {
      this.events.publish('userCheck');
    }
    // do something with the errorswitch (res.status) {
  }

  navCtrl: NavController;
  private getNavCtrl() {
    this.navCtrl = this.appCtrl.getActiveNav();
  }
}