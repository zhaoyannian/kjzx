import { NativeService } from ".././../../../icommon/provider/native";
import { Component } from "@angular/core";
import { NavController, NavParams } from "ionic-angular";
import { ENV } from "@env/environment";
import { MeetApproPage } from "../../../imeeting/meetings/meetAppro/meetAppro";

@Component({
  selector: "page-todoList",
  templateUrl: "todoList.html"
})
export class TodoListPage {
  list: any = [];
  meetApproval: any = [];
  AllMesage: any = [];
  cslist: any = {};
  state: any = ENV.httpurl;
  constructor(
    public NativeService: NativeService,
    public navCtrl: NavController,
    public navParams: NavParams
  ) {
    this.list = this.navParams.get("list");
    this.meetApproval = this.navParams.get("meet");
    this.AllMesage = this.navParams.get("sjList");
    this.cslist = this.navParams.get("cslist");
  }

  //会议审批待办列表
  meetAppro() {
    this.navCtrl.push(MeetApproPage);
  }
  //数据上报待办列表
  dataAppro() {}
  goback() {
    this.navCtrl.pop();
  }
  //其余待办列表
  dbAppro(item) {
    if (!item.url) {
      this.NativeService.showAlert("请联系管理员配置流程信息");
      return;
    } else if (!item.alias) {
      this.NativeService.showAlert("请联系管理员配置流程信息");
      return;
    } else {
      this.navCtrl.push(item.url, { alias: item.alias, type: 2 }); //2是代办
    }
  }
  cgsh(type) {
    this.navCtrl.push("PurchaseflowPage", { flowType: type });
  }

  //元器件
  yqj() {
    this.navCtrl.push("ZyPurchaseflowPage");
  }
}
