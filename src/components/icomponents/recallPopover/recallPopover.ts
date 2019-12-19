import { NavController, ViewController, NavParams } from "ionic-angular";
import { Component } from "@angular/core";
import { NativeService } from "./../../../icommon/provider/native";
import { HttpClient } from "@angular/common/http";
import { ENV } from "@env/environment";

import _ from "lodash";
@Component({
  selector: "page-recallPopover",
  templateUrl: "recallPopover.html"
})
export class RecallPopoverPage {
  loginObj: any;
  opinion: any = "";
  constructor(
    public navCtrl: NavController,
    public viewCtrl: ViewController,
    public NativeService: NativeService,
    public navParams: NavParams,
    public http: HttpClient
  ) {
    this.loginObj = this.navParams.get("entry");
  }

  recall() {
    if (this.opinion.length == 0) {
      this.NativeService.showAlert("请填写撤回理由！");
      return;
    } else {
      var self = this;
      let entry = {
        businessId: this.loginObj.id,
        businessKey: this.loginObj.businessKey.id,
        options: this.opinion
      };
      return self.http
        .post(ENV.httpurl + "/api/wfCorpConfi/revokeWf", entry)
        .subscribe(
          resp => {
            this.viewCtrl.dismiss();
            if (resp["result"] == true) {
              this.NativeService.showAlert("撤回成功！！");
              return;
            } else {
              this.NativeService.showAlert("撤回失败！");
              return;
            }
          },
          error => {
            this.viewCtrl.dismiss();
            this.NativeService.showAlert("撤回失败！");
            return;
          }
        );
    }
  }
  callBack() {
    this.viewCtrl.dismiss();
  }
}
