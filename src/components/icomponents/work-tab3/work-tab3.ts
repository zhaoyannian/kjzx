import { Component, Input } from "@angular/core";
import { globalData } from "./../../../icommon/provider/globalData";
import { NativeService } from "./../../../icommon/provider/native";
import {
  NavController,
  NavParams,
  AlertController,
  Events,
  ModalController,
  PopoverController
} from "ionic-angular";
import { WorkhoursEditPage } from "../../../pages/ihome/workhours/draft/editDraft";
import { HttpClient } from "@angular/common/http";
import { ENV } from "@env/environment";
import {
  queryAllAliasUri,
  queryListByPageUri,
  deleteUri,
  queryListByPageUri2,
  deleteUri2,
  queryListByPageUri3,
  deleteUri3,
  queryListByPageUri4,
  deleteUri4,
  queryAllAliasUri4,
  queryListByPageUri5,
  deleteUri5,
  queryListByPageUri6,
  deleteUri6,
  queryListByPageUri7,
  deleteUri7,
  queryListByPageUri8,
  deleteUri8,
  queryListByPageUri9,
  deleteUri9,
  queryListByPageUri10,
  deleteUri10,
  queryAllAliasUri3,
  queryListUri3
} from "./../../../icommon/provider/Constants";
import _ from "lodash";
import { Observable } from "rxjs/Rx";
import { RecallPopoverPage } from "../recallPopover/recallPopover";
/**
 * Generated class for the WorkTab1Component component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: "work-tab3",
  templateUrl: "work-tab3.html"
})
export class WorkTab3Component {
  @Input() aliasMold;
  //第几页
  page: any = 1;
  //一页多少条
  pageSize: any = 10;
  userinfor: any;
  allList: any = [];
  wfInstStatuss: any;
  dictOpts: any;
  //总条数
  totalCount: number = 0;
  allListUrl: any;
  deleteListUrl: any;
  waitListUrl: any;
  toggle: any;
  queryKey: any = "";
  constructor(
    public modalCtrl: ModalController,
    public globalData: globalData,
    private alerCtrl: AlertController,
    public nativeService: NativeService,
    public NavCtrl: NavController,
    public navParams: NavParams,
    public http: HttpClient,
    private events: Events,
    public popoverCtrl: PopoverController
  ) {}
  ngOnDestroy() {
    this.events.unsubscribe("tabs:AllData");
  }

  ngOnInit() {
    this.events.subscribe("tabs:AllData", (num, time) => {
      this.toggle = num;
      this.queryKey = time;
      this.page = 1;
      this.loadOrderDataFn(null);
    });
    // 监听页面刷新
    Observable.fromEvent(window, "beforeunload").subscribe(event => {
      console.log("页面刷新了");
    });
    this.userinfor = JSON.parse(localStorage.getItem("objectList"));
    this.wfInstStatuss = {
      inprocess: "流转中",
      complate: "办结",
      terminal: "终止"
    };
    if (this.aliasMold == "ProjectDaily") {
      this.allListUrl = queryListByPageUri;
      this.deleteListUrl = deleteUri;
      // 数据字典翻译
      this.dictOpts = [
        {
          dict: "WY_BUSINESS_STATUS",
          orgField: "procedureStatus",
          destField: "procedureStatusName"
        }
      ];
    } else if (
      this.aliasMold.indexOf("SHIJIA") > -1 ||
      this.aliasMold.indexOf("otherLeave3") > -1 ||
      this.aliasMold.indexOf("Annual1") > -1
    ) {
      this.http
        .post(ENV.httpurl + queryAllAliasUri, {})
        .subscribe(async result => {
          this.aliasMold = "";
          if (!!result) {
            _.map(result, aliasTo => {
              this.aliasMold += aliasTo["alias"] + ",";
            });
          }
        });
      this.allListUrl = queryListByPageUri2;
      this.deleteListUrl = deleteUri2;
      // 数据字典翻译
      this.dictOpts = [
        {
          dict: "DFKY_LEAVE_STATUS",
          orgField: "procedureStatus",
          destField: "procedureStatusName"
        }
      ];
    } else if (this.aliasMold.indexOf("SealApply") > -1) {
      //印章申请
      this.http
        .post(ENV.httpurl + queryAllAliasUri3, {})
        .subscribe(async result => {
          this.aliasMold = "";
          if (!!result) {
            _.map(result, aliasTo => {
              this.aliasMold += aliasTo["alias"] + ",";
            });
          }
        });
      this.allListUrl = queryListByPageUri3;
      this.waitListUrl = queryListUri3;
      this.deleteListUrl = deleteUri3;
      // 数据字典翻译
      this.dictOpts = [
        {
          dict: "WY_BUSINESS_STATUS",
          orgField: "procedureStatus",
          destField: "procedureStatusName"
        }
      ];
    } else if (this.aliasMold.indexOf("ICCard") > -1) {
      //身份卡管理
      this.http
        .post(ENV.httpurl + queryAllAliasUri4, {})
        .subscribe(async result => {
          this.aliasMold = "";
          if (!!result) {
            _.map(result, aliasTo => {
              this.aliasMold += aliasTo["alias"] + ",";
            });
          }
        });
      this.allListUrl = queryListByPageUri4;
      this.deleteListUrl = deleteUri4;
      // 数据字典翻译
      this.dictOpts = [
        {
          dict: "WY_BUSINESS_STATUS",
          orgField: "procedureStatus",
          destField: "procedureStatusName"
        }
      ];
    } else if (this.aliasMold.indexOf("networkResource") > -1) {
      //网络资源管理
      this.allListUrl = queryListByPageUri5;
      this.deleteListUrl = deleteUri5;
      this.aliasMold = "networkResource,networkResource2";
      // 数据字典翻译
      this.dictOpts = [
        {
          dict: "WY_BUSINESS_STATUS",
          orgField: "procedureStatus",
          destField: "procedureStatusName"
        }
      ];
    } else if (this.aliasMold == "webService") {
      //网络服务管理
      this.allListUrl = queryListByPageUri10;
      this.deleteListUrl = deleteUri10;
      // 数据字典翻译
      this.dictOpts = [
        {
          dict: "WY_BUSINESS_STATUS",
          orgField: "procedureStatus",
          destField: "procedureStatusName"
        }
      ];
    } else if (this.aliasMold == "goOutFlow") {
      //外出报备
      this.allListUrl = queryListByPageUri6;
      this.deleteListUrl = deleteUri6;
      // 数据字典翻译
      this.dictOpts = [
        {
          dict: "WY_BUSINESS_STATUS",
          orgField: "procedureStatus",
          destField: "procedureStatusName"
        }
      ];
    } else if (this.aliasMold == "ItemFile") {
      //事项文件
      this.allListUrl = queryListByPageUri7;
      this.deleteListUrl = deleteUri7;
      // 数据字典翻译
      this.dictOpts = [
        {
          dict: "WY_BUSINESS_STATUS",
          orgField: "procedureStatus",
          destField: "procedureStatusName"
        }
      ];
    } else if (this.aliasMold == "evection") {
      //出差申请
      this.allListUrl = queryListByPageUri8;
      this.deleteListUrl = deleteUri8;
      // 数据字典翻译
      this.dictOpts = [
        {
          dict: "WY_BUSINESS_STATUS",
          orgField: "procedureStatus",
          destField: "procedureStatusName"
        }
      ];
    } else if (this.aliasMold == "ReserveCarWF") {
      //用车申请
      this.allListUrl = queryListByPageUri9;
      this.deleteListUrl = deleteUri9;
      // 数据字典翻译
      this.dictOpts = [
        {
          dict: "WY_BUSINESS_STATUS",
          orgField: "procedureStatus",
          destField: "procedureStatusName"
        }
      ];
    }
    // this.loadOrderDataFn(null);
  }
  loadOrderDataFn(refresher) {
    this.nativeService.showLoading();
    let data = {
      appUserId: this.userinfor.staff.userId
    };
    this.page = 1;
    let pageInfo = {
      page: 1,
      pageSize: this.pageSize,
      queryKey: this.queryKey
    };
    this.commonLoad(data, pageInfo, refresher, null);
  }
  commonLoad(data, pageInfo, refresher, infiniteScroll) {
    let that = this;
    this.http
      .post(ENV.httpurl + this.allListUrl, data, { params: pageInfo })
      .subscribe(
        async result => {
          this.totalCount = result["count"];
          this.nativeService.hideLoading();
          if (!!infiniteScroll) {
            this.allList = this.allList.concat(result["data"]);
          } else {
            this.allList = result["data"];
          }
          this.globalData.transformDict(this.dictOpts, this.allList, "oa");
          let wait1 = that.globalData
            .getWfInstListByBizList(this.allList)
            .then(wfInstList => {
              _.each(this.allList, n => {
                n.wfInst = _.find(wfInstList, d => d["bizId"] == n.id);
              });
            });
          let wait2 = that.globalData
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
          if (!!refresher) {
            refresher.complete();
          }
          if (!!infiniteScroll) {
            infiniteScroll.complete();
          }
        },
        error => {
          this.allList = [];
          if (!!refresher) {
            refresher.complete();
          }
          if (!!infiniteScroll) {
            infiniteScroll.complete();
          }
          this.nativeService.hideLoading();
        }
      );
  }

  //刷新
  tabslideRefreshFn(refresher) {
    this.loadOrderDataFn(refresher);
  }
  //下拉分页查询
  tabslideNextRefreshFn(infiniteScroll) {
    if (this.totalCount == this.allList.length) {
      infiniteScroll.complete();
    } else {
      let data = {
        appUserId: this.userinfor.staff.userId
      };
      this.page += 1;
      let pageInfo = { page: this.page, pageSize: this.pageSize };
      this.commonLoad(data, pageInfo, null, infiniteScroll);
    }
  }
  // 草稿状态 编辑、查看
  toCreate(entry, opeType) {
    if (this.aliasMold == "ProjectDaily") {
      this.NavCtrl.push(WorkhoursEditPage, {
        entry: entry,
        opeType: opeType,
        ref: null,
        toggle: this.toggle
      });
    } else if (
      this.aliasMold.indexOf("SHIJIA") > -1 ||
      this.aliasMold.indexOf("otherLeave3") > -1 ||
      this.aliasMold.indexOf("Annual1") > -1
    ) {
      this.NavCtrl.push("VacationDraftPage", {
        entry: entry,
        opeType: opeType,
        ref: null,
        toggle: this.toggle
      });
    } else if (this.aliasMold.indexOf("SealApply") > -1) {
      //印章申请
      this.NavCtrl.push("SealDraftPage", {
        entry: entry,
        opeType: opeType,
        ref: null,
        toggle: this.toggle
      });
    } else if (this.aliasMold.indexOf("ICCard") > -1) {
      //身份卡管理
      this.NavCtrl.push("IccardDraftPage", {
        entry: entry,
        opeType: opeType,
        ref: null,
        toggle: this.toggle
      });
    } else if (this.aliasMold.indexOf("networkResource") > -1) {
      //网络资源管理
      this.NavCtrl.push("NetworkDraftPage", {
        entry: entry,
        opeType: opeType,
        ref: null,
        toggle: this.toggle
      });
    } else if (this.aliasMold == "goOutFlow") {
      //网络资源管理
      this.NavCtrl.push("GooutDraftPage", {
        entry: entry,
        opeType: opeType,
        ref: null,
        toggle: this.toggle
      });
    } else if (this.aliasMold == "webService") {
      //网络服务管理
      this.NavCtrl.push("ServiceDraftPage", {
        entry: entry,
        opeType: opeType,
        ref: null,
        toggle: this.toggle
      });
    } else if (this.aliasMold == "goOutFlow") {
      //网络服务管理
      this.NavCtrl.push("GooutDraftPage", {
        entry: entry,
        opeType: opeType,
        ref: null,
        toggle: this.toggle
      });
    } else if (this.aliasMold == "ItemFile") {
      //事项文件
      this.NavCtrl.push("MattersDraftPage", {
        entry: entry,
        opeType: opeType,
        ref: null,
        toggle: this.toggle
      });
    } else if (this.aliasMold == "evection") {
      //出差申请
      this.NavCtrl.push("EvectionDraftPage", {
        entry: entry,
        opeType: opeType,
        ref: null,
        toggle: this.toggle
      });
    } else if (this.aliasMold == "ReserveCarWF") {
      //用车申请
      this.NavCtrl.push("UserCarDraftPage", {
        entry: entry,
        opeType: opeType,
        ref: null,
        toggle: this.toggle
      });
    }
  }
  // 查看(我的申请)
  toEditor2(entry, opeType) {
    if (this.aliasMold == "ProjectDaily") {
      this.NavCtrl.push("EditPage", {
        entry: entry,
        id: entry.id,
        opeType: opeType,
        ref: entry.wfInst.resourceInstId,
        wfAlias: entry.wfInst.defAlias,
        toggle: this.toggle
      });
    } else if (
      this.aliasMold.indexOf("SHIJIA") > -1 ||
      this.aliasMold.indexOf("otherLeave3") > -1 ||
      this.aliasMold.indexOf("Annual1") > -1
    ) {
      this.NavCtrl.push("VacationEditPage", {
        entry: entry,
        id: entry.id,
        opeType: opeType,
        ref: entry.wfInst.resourceInstId,
        wfAlias: entry.wfInst.defAlias,
        toggle: this.toggle
      });
    } else if (this.aliasMold.indexOf("SealApply") > -1) {
      //印章申请
      this.NavCtrl.push("SealEditPage", {
        entry: entry,
        id: entry.id,
        opeType: opeType,
        ref: entry.wfInst.resourceInstId,
        wfAlias: entry.wfInst.defAlias,
        toggle: this.toggle
      });
    } else if (this.aliasMold.indexOf("ICCard") > -1) {
      //身份卡管理
      this.NavCtrl.push("IccardEditPage", {
        entry: entry,
        id: entry.id,
        opeType: opeType,
        ref: entry.wfInst.resourceInstId,
        wfAlias: entry.wfInst.defAlias,
        toggle: this.toggle
      });
    } else if (this.aliasMold.indexOf("networkResource") > -1) {
      //网络资源管理
      this.NavCtrl.push("NetworkEditPage", {
        entry: entry,
        id: entry.id,
        opeType: opeType,
        ref: entry.wfInst.resourceInstId,
        wfAlias: entry.wfInst.defAlias,
        toggle: this.toggle
      });
    } else if (this.aliasMold == "goOutFlow") {
      //网络资源管理
      this.NavCtrl.push("GooutEditorPage", {
        entry: entry,
        id: entry.id,
        opeType: opeType,
        ref: entry.wfInst.resourceInstId,
        wfAlias: entry.wfInst.defAlias,
        toggle: this.toggle
      });
    } else if (this.aliasMold == "webService") {
      //网络服务管理
      this.NavCtrl.push("ServiceEditPage", {
        entry: entry,
        id: entry.id,
        opeType: opeType,
        ref: entry.wfInst.resourceInstId,
        wfAlias: entry.wfInst.defAlias,
        toggle: this.toggle
      });
    } else if (this.aliasMold == "goOutFlow") {
      //网络服务管理
      this.NavCtrl.push("GooutEditorPage", {
        entry: entry,
        id: entry.id,
        opeType: opeType,
        ref: entry.wfInst.resourceInstId,
        wfAlias: entry.wfInst.defAlias,
        toggle: this.toggle
      });
    } else if (this.aliasMold == "ItemFile") {
      //事项文件
      this.NavCtrl.push("MattersEditPage", {
        entry: entry,
        id: entry.id,
        opeType: opeType,
        ref: entry.wfInst.resourceInstId,
        wfAlias: entry.wfInst.defAlias,
        toggle: this.toggle
      });
    } else if (this.aliasMold == "evection") {
      //出差申请
      this.NavCtrl.push("EvectionEditorPage", {
        entry: entry,
        id: entry.id,
        opeType: opeType,
        ref: entry.wfInst.resourceInstId,
        wfAlias: entry.wfInst.defAlias,
        toggle: this.toggle
      });
    } else if (this.aliasMold == "ReserveCarWF") {
      //用车申请
      this.NavCtrl.push("UserCarEditPage", {
        entry: entry,
        id: entry.id,
        opeType: opeType,
        ref: entry.wfInst.resourceInstId,
        wfAlias: entry.wfInst.defAlias,
        toggle: this.toggle
      });
    }
  }
  //草稿状态删除
  delete(entry) {
    this.showAlert(entry);
  }
  deleteId(entry) {
    this.nativeService.showLoading();
    this.http.get(ENV.httpurl + this.deleteListUrl + "/" + entry.id).subscribe(
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
  //撤回功能
  toRecall(item) {
    let popover = this.popoverCtrl.create(RecallPopoverPage, { entry: item });
    popover.onDidDismiss(data => {
      this.loadOrderDataFn(null);
    });
    popover.present();
  }
}
