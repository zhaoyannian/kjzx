import { NativeService } from "./../../../icommon/provider/native";
import { globalData } from "./../../../icommon/provider/globalData";
import { Component } from "@angular/core";
import { NavController, NavParams } from "ionic-angular";
import _ from "lodash";
import { HttpClient } from "@angular/common/http";
import { ENV } from "@env/environment";

@Component({
  selector: "page-select-advise",
  templateUrl: "select-advise.html"
})
export class SelectAdvisePage {
  callback;
  dataList: any = [];
  entry: any = {};
  deptIds: any = "";
  allList: any = [];
  //总条数
  totalCount: number = 0;
  //第几页
  page: any = 1;
  //一页多少条
  pageSize: any = 10;
  queryKey: any = "";
  selectRadio: string = "";
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
    this.NativeService.showLoading();
    let data = {
      isEnd: "TRUE",
      showAll: "TRUE"
    };
    this.page = 1;
    let pageInfo = {
      page: 1,
      pageSize: this.pageSize,
      queryKey: this.queryKey
    };
    this.queryPage(data, pageInfo, null);
  }
  //返回上一层
  goback() {
    this.navCtrl.pop();
  }
  //获取回复内容
  queryPage(data, pageInfo, infiniteScroll) {
    this.http
      .post(ENV.httpurl + "/api/exchangeAdvise/queryPage", data, {
        params: pageInfo
      })
      .subscribe(
        data => {
          this.NativeService.hideLoading();
          if (this.page == 1) {
            this.totalCount = data["count"];
            this.allList = data["data"];
          } else {
            this.allList = this.allList.concat(data["data"]);
          }
          if (!!infiniteScroll) {
            infiniteScroll.complete();
          }
        },
        error => {
          this.NativeService.hideLoading();
          if (!!infiniteScroll) {
            infiniteScroll.complete();
          }
        }
      );
  }
  //下拉分页查询
  tabslideNextRefreshFn(infiniteScroll) {
    if (this.totalCount == this.allList.length) {
      infiniteScroll.complete();
    } else {
      let data = {
        orderType: "allot",
        showAll: "TRUE"
      };
      this.page += 1;
      let pageInfo = {
        page: this.page,
        pageSize: this.pageSize,
        queryKey: this.queryKey
      };
      this.queryPage(data, pageInfo, infiniteScroll);
    }
  }

  //确定选择
  close() {
    if (this.selectRadio == null || this.selectRadio == "") {
      this.NativeService.showAlert("请选择转发信息");
    } else {
      let sender;
      for (let i = 0; i < this.allList.length; i++) {
        if (this.allList[i].id == this.selectRadio) {
          sender = this.allList[i];
          break;
        }
      }
      this.dataList.push(sender);
      this.callback({ dataList: this.dataList }).then(() => {
        this.navCtrl.pop();
      });
    }
  }
  select(item) {
    this.entry = item;
  }
}
