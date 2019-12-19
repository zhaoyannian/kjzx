import { Component } from "@angular/core";
import {
  NavController,
  ModalController,
  NavParams,
  Events
} from "ionic-angular";
import { HttpClient } from "@angular/common/http";
import { ENV } from "@env/environment";
import _ from "lodash";
import "rxjs/add/operator/timeout";
import { zyglobalData } from "../../../../icommon/provider/zyglobalData";
import { NativeService } from "../../../../icommon/provider/native";

/**
 * Generated class for the PurchaseSlide2Page page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: "page-zy-purchase-slide2",
  templateUrl: "zy-purchase-slide2.html"
})
export class ZyPurchaseSlide2Page {
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
  wfAlias: any;
  constructor(
    public zyglobalData: zyglobalData,
    public http: HttpClient,
    public nativeService: NativeService,
    private modalCtrl: ModalController,
    public navCtrl: NavController,
    public navParams: NavParams,
    private events: Events
  ) {
    this.wfAlias = "yqj_apply,yqj_apply_zx";
    this.status = {
      complate: "完成",
      back: "回退",
      inprocess: "流转中",
      refuse: "拒绝",
      cancel: "取消",
      terminal: "终止",
      draft: "草稿"
    };
  }

  ngOnDestroy() {
    this.events.unsubscribe("zy-purchase:dealData");
  }
  ngOnInit() {
    this.userinfor = JSON.parse(localStorage.getItem("objectList"));
    this.events.subscribe("zy-purchase:dealData", (num, time) => {
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
      page: 1,
      pageSize: this.pageSize,
      queryKey: this.queryKey
    };
    this.commonLoad(data, pageInfo, null);
  }
  commonLoad(data, pageInfo, infiniteScroll) {
    this.http
      .post(
        ENV.httpurlzyscm + "/api/wfApp/myNotifyYbApp/" + this.wfAlias,
        data,
        { params: pageInfo }
      )
      .subscribe(
        resp => {
          this.nativeService.hideLoading();
          if (this.page == 1) {
            this.totalCount = resp["total"];
            this.allList = resp["rows"];
          } else {
            this.allList = this.allList.concat(resp["rows"]);
          }
          let dictOpts = [
            {
              dict: "SYS_COMPONENT_COMMONTYPE",
              orgField: "wfInstStatus",
              destField: "wfInstStatusName"
            },
            {
              dict: "WY_BUSINESS_STATUS",
              orgField: "pointInstStatus",
              destField: "pointInstStatusName"
            }
          ];
          this.zyglobalData.transformDict(dictOpts, this.allList, "oa");
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
      ); // 出错，返回空对象);
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
  //查看详情
  dealEntity(entry, opeType) {
    this.navCtrl.push("ZyCompopurappliPage", {
      entry: entry,
      id: entry.bizId,
      opeType: opeType,
      ref: entry.resourceInstId,
      wfAlias: entry.workflowAlias,
      toggle: this.toggle
    });
  }
  //催办
  urge(entry) {
    this.nativeService.showLoading();
    this.http
      .get(ENV.httpurlzyscm + "/api/wfApp/pressSbDialogPre" + "/" + entry.bizId)
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
