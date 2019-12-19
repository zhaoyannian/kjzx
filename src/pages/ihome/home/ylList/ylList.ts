import { Component } from "@angular/core";
import { NavController, NavParams } from "ionic-angular";
import { ENV } from "@env/environment";
import { NativeService } from "../../../../icommon/provider/native";
import { IstaffadvisePage } from "../../../../pages/istaffadvise/istaffadvise";
@Component({
  selector: "page-ylList",
  templateUrl: "ylList.html"
})
export class YlListPage {
  list: any = [];
  state: any = ENV.httpurl;
  constructor(
    public NativeService: NativeService,
    public navCtrl: NavController,
    public navParams: NavParams
  ) {
    this.list = this.navParams.get("list");
  }

  //进入常用应用各模块列表页
  goUseList(item) {
    if (!item.appUrl) {
      this.NativeService.showAlert("请联系管理员配置流程信息");
      return;
    } else if (!item.appAlias) {
      this.NativeService.showAlert("请联系管理员配置流程信息");
      return;
    } else if (item.appUrl === "IstaffadvisePage") {
      this.navCtrl.push(IstaffadvisePage); //1是新增
    } else {
      this.navCtrl.push(item.appUrl, { alias: item.appAlias, type: 1 });
    }
  }
  goback() {
    this.navCtrl.pop();
  }
}
