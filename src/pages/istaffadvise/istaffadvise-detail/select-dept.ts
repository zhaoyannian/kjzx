import { NativeService } from "./../../../icommon/provider/native";
import { globalData } from "./../../../icommon/provider/globalData";
import { Component } from "@angular/core";
import { NavController, NavParams } from "ionic-angular";
import _ from "lodash";
import { HttpClient } from "@angular/common/http";
import { ENV } from "@env/environment";

@Component({
  selector: "page-select-dept",
  templateUrl: "select-dept.html"
})
export class SelectDeptPage {
  data: any = [];
  callback;
  entry: any = {};
  dataList: any = [];
  deptIds: any = "";
  constructor(
    public NativeService: NativeService,
    public http: HttpClient,
    public globalData: globalData,
    public navCtrl: NavController,
    public navParams: NavParams
  ) {
    this.callback = this.navParams.get("callback");
    this.deptIds = this.navParams.get("deptIds");
  }
  //初始化
  ionViewDidEnter() {
    this.queryPage();
  }
  //返回上一层
  goback() {
    this.navCtrl.pop();
  }
  //获取部门信息
  queryPage() {
    this.http
      .post(ENV.httpurl + "/api/exchangeAdvise/queryAllList", {})
      .subscribe(data => {
        if (data["message"] === "true") {
          for (let d in data["data"]) {
            data["data"][d].checked = false;
            if (
              !!this.deptIds &&
              !!data["data"][d].deptOrgId &&
              this.deptIds.indexOf(data["data"][d].deptOrgId) >= 0
            ) {
              data["data"][d].checked = true;
            }
          }
          this.data = data["data"];
        } else {
          this.NativeService.showAlert(data["data"]);
        }
      });
  }
  //确定选择
  close() {
    if (this.dataList.length <= 0) {
      this.NativeService.showAlert("请选择建议回复部门");
    } else {
      this.callback({ dataList: this.dataList }).then(() => {
        this.navCtrl.pop();
      });
    }
  }
  //选择建议回复部门
  select(item) {
    this.entry = item;
    if (this.entry.checked) {
      let login = _.filter(
        this.dataList,
        n => n.deptOrgId == this.entry.deptOrgId
      );
      //将选择部门加到集合this.dataList中
      if (login.length <= 0) {
        this.dataList.push(this.entry);
      }
    } else {
      let login = _.filter(
        this.dataList,
        n => n.deptOrgId == this.entry.deptOrgId
      );
      //删除未选择部门
      if (login.length > 0) {
        this.dataList = _.filter(
          this.dataList,
          n => n.deptOrgId != this.entry.deptOrgId
        );
      }
    }
  }
}
