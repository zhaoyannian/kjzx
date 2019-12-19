import { Component } from "@angular/core";
import {
  NavController,
  NavParams,
  ModalController,
  AlertController,
  Events
} from "ionic-angular";
import { HttpClient } from "@angular/common/http";
import { ENV } from "@env/environment";
import _ from "lodash";
import "rxjs/add/operator/timeout";
import { zyglobalData } from "../../../../icommon/provider/zyglobalData";
import { NativeService } from "../../../../icommon/provider/native";

/**
 * Generated class for the PurchaseSlide3Page page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: "page-zy-purchase-slide3",
  templateUrl: "zy-purchase-slide3.html"
})
export class ZyPurchaseSlide3Page {
  //当前选择的分组按钮
  toggle = "awiatData";
  //第几页
  page: any = 1;
  //一页多少条
  pageSize: any = 5;
  userinfor: any;
  allList: any = [];
  //总条数
  totalCount: number;
  flowType: any;
  queryKey: any;
  currUserId: any;
  status: any = "1";
  pageInfo: any;
  url: any;
  title: any;
  dictOpts: any;
  constructor(
    public zyglobalData: zyglobalData,
    public http: HttpClient,
    private alerCtrl: AlertController,
    private modalCtrl: ModalController,
    public nativeService: NativeService,
    public navCtrl: NavController,
    public navParams: NavParams,
    private events: Events
  ) {
    // 数据字典翻译
    this.dictOpts = [
      {
        dict: "WY_BUSINESS_STATUS",
        orgField: "procedureStatus",
        destField: "procedureStatusName"
      }
    ];
  }

  ngOnDestroy() {
    this.events.unsubscribe("zy-purchase:complateData");
  }
  ngOnInit() {
    this.userinfor = JSON.parse(localStorage.getItem("objectList"));
    this.events.subscribe("zy-purchase:complateData", (num, time) => {
      this.toggle = num;
      this.queryKey = time;
      this.page = 1;
      this.loadOrderDataFn(null);
    });
  }
  loadOrderDataFn(refresher) {
    this.nativeService.showLoading();
    let data = {};
    this.page = 1;
    let pageInfo = {
      page: this.page,
      pageSize: this.pageSize,
      queryKey: this.queryKey
    };
    this.commonLoad(data, pageInfo, null);
  }
  commonLoad(data, pageInfo, infiniteScroll) {
    this.http
      .post(ENV.httpurlzyscm + "/api/wfApp/queryPage", data, {
        params: pageInfo
      })
      .subscribe(
        async resp => {
          this.nativeService.hideLoading();
          if (this.page == 1) {
            this.totalCount = resp["total"];
            this.allList = resp["rows"];
          } else {
            this.allList = this.allList.concat(resp["rows"]);
          }
          this.zyglobalData.transformDict(this.dictOpts, this.allList, "oa");
          let wait1 = this.zyglobalData
            .getWfInstListByBizList(this.allList)
            .then(wfInstList => {
              _.each(this.allList, n => {
                n.wfInst = _.find(wfInstList, d => d["bizId"] == n.id);
              });
            });
          let wait2 = this.zyglobalData
            .getWfResourceListByBizList(this.allList)
            .then(wfResourceList => {
              _.each(this.allList, n => {
                n.wfResourceList = _.filter(
                  wfResourceList,
                  d => d["bizId"] == n.id
                );
              });
            });
          await wait1;
          await wait2;
          if (!!infiniteScroll) {
            infiniteScroll.complete();
          }
        },
        error => {
          this.nativeService.hideLoading();
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
      let data = {};
      this.page += 1;
      let pageInfo = {
        page: this.page,
        pageSize: this.pageSize,
        queryKey: this.queryKey
      };
      this.commonLoad(data, pageInfo, infiniteScroll);
    }
  }
  //查看流程数据
  dealEntity(entry, opeType) {
    this.navCtrl.push("ZyCompopurappliPage", {
      entry: entry,
      id: entry.id,
      opeType: opeType,
      ref: entry.wfInst.resourceInstId,
      wfAlias: entry.wfInst.defAlias,
      toggle: this.toggle
    });
  }
  //查看采购数据
  dealEntityDraft(entry, opeType) {
    this.navCtrl.push("ZyCompopurappliPage", {
      entry: entry,
      id: entry.id,
      opeType: opeType,
      ref: null,
      wfAlias: null,
      toggle: this.toggle
    });
  }
  //删除草稿数据
  delete(entry) {
    this.showAlert(entry);
  }
  deleteId(entry) {
    this.nativeService.showLoading();
    this.http
      .get(ENV.httpurlzyscm + "/api/wfApp/delete" + "/" + entry.id)
      .subscribe(
        result => {
          this.loadOrderDataFn(null);
          this.nativeService.hideLoading();
        },
        error => {
          this.nativeService.hideLoading();
        }
      );
  }
  async showAlert(entry) {
    let confirm = this.alerCtrl.create({
      title: "确定删除吗？",
      message: "",
      buttons: [
        {
          text: "取消",
          handler: () => {}
        },
        {
          text: "确定",
          handler: () => {
            this.deleteId(entry);
          }
        }
      ]
    });
    await confirm.present();
  }
  //催办
  urge(entry) {
    this.nativeService.showLoading();
    this.http
      .get(ENV.httpurlzyscm + "/api/wfApp/pressSbDialogPre" + "/" + entry.id)
      .subscribe(
        data => {
          if (data["result"]) {
            let chooseMOdel = this.modalCtrl.create("SelectCuiBanPage", {
              businessId: data["objBean"].businessId,
              businessKey: data["objBean"].associatedBusinessKey.id
            });
            chooseMOdel.onDidDismiss(data => {});
            chooseMOdel.present();
          } else {
            this.nativeService.showAlert(data["message"]);
            return;
          }
          this.nativeService.hideLoading();
        },
        error => {
          this.nativeService.hideLoading();
        }
      );
  }
}
