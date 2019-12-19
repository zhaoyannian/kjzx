import { NativeService } from "./../../../../icommon/provider/native";
import { globalData } from "./../../../../icommon/provider/globalData";
import { Component } from "@angular/core";
import {
  IonicPage,
  NavController,
  AlertController,
  NavParams,
  ViewController
} from "ionic-angular";
import _ from "lodash";
import { HttpClient } from "@angular/common/http";
import { ENV } from "@env/environment";

@IonicPage()
@Component({
  selector: "page-select-cuiban",
  templateUrl: "select-cuiban.html"
})
export class SelectCuiBanPage {
  data: any = [];
  businessId: any = "";
  entry: any = {};
  dataList: any = [];
  businessKey: any = "";
  constructor(
    public NativeService: NativeService,
    public http: HttpClient,
    public globalData: globalData,
    public navCtrl: NavController,
    private alerCtrl: AlertController,
    private viewCtrl: ViewController,
    public navParams: NavParams
  ) {
    this.businessId = this.navParams.get("businessId");
    this.businessKey = this.navParams.get("businessKey");
  }
  //初始化
  ionViewDidEnter() {
    this.queryPage();
  }
  //返回上一层
  goback() {
    this.viewCtrl.dismiss();
  }
  //获取部门信息
  queryPage() {
    this.http
      .get(
        ENV.httpurlzyscm +
          "/api/wfApp/pressSbPre" +
          "/" +
          this.businessId +
          "/" +
          this.businessKey
      )
      .subscribe(data => {
        this.dataList = data;
      });
  }
  //发送消息提醒
  async sendMessageFn() {
    let confirm = this.alerCtrl.create({
      title: "您确认想要发送消息吗？发送以后办理人会收到消息",
      message: "",
      buttons: [
        {
          text: "取消",
          handler: () => {}
        },
        {
          text: "确定",
          handler: () => {
            this.http
              .post(ENV.httpurlzyscm + "/api/wfApp/sendMessages", this.dataList)
              .subscribe(
                data => {
                  if (data["result"]) {
                    this.NativeService.showAlert("发送成功");
                    this.viewCtrl.dismiss();
                  } else {
                    this.NativeService.showAlert("发送失败");
                    return;
                  }
                },
                err => {
                  this.NativeService.showAlert("发送失败");
                  return;
                }
              );
          }
        }
      ]
    });
    await confirm.present();
  }
}
