import { NativeService } from ".././../../icommon/provider/native";
import { Component } from "@angular/core";
import {
  NavController,
  Events,
  AlertController,
  ModalController
} from "ionic-angular";
import { SettingPage } from "../../imine/setting/setting";
import { NewsListPage } from "./newsList/newsList";
import { NewsImgPage } from "./newsList/newsImg";
import { NewsVideoPage } from "./newsList/newsVideo";
import { NewsTextPage } from "./newsList/newsText";
import { HttpClient } from "@angular/common/http";
import { ENV } from "@env/environment";
import { EditorViewPage } from "../../imeeting/meetings/editor/editorView";
import { NewsDetailPage } from "./newsList/newsDetail";
import { SchedulePage } from "../../ischedule/calendar/newSchedule/newSchedule";
import { TodoListPage } from "./todoList/todoList";
import { YlListPage } from "./ylList/ylList";
import { globalData } from "./../../../icommon/provider/globalData";
import { MeetApproPage } from "../../imeeting/meetings/meetAppro/meetAppro";
import _ from "lodash";
import { Helper } from "./../../../icommon/provider/jpush";

import { LoginPage } from "../../../pages/login/login";
import { IstaffadvisePage } from "../../../pages/istaffadvise/istaffadvise";

// import { WorkhoursEditPage } from '../workhours/draft/editDraft';
// import { ChangepwdPage } from '../../../pages/imine/setting/changepwd/changepwd';
import {
  readEquPurFlowUri,
  readCompoFlowUri,
  readIcaFlowUri,
  readMcFlowUri,
  entrustApplyFlowUri,
  equPurFlowIcaDefId,
  compoFlowMcDefId,
  flowIcaDefId,
  flowMcDefId,
  resuQuDefId,
  entrustApplyId
} from "./../../../icommon/provider/Constantscg";
@Component({
  selector: "page-home",
  templateUrl: "home.html"
})
export class HomePage {
  dataShortList: any = []; //常用应用全部
  dataSList: any = []; //常用应用截取数据
  dataNewList: any = []; //新闻模块列表
  dataDbListNew: any = [];
  dataDbList: any = []; //待办模块列表
  dataCalList: any = []; //今日日程列表
  dataMeetList: any = []; // 会议信息
  AllMesage: any = []; //数据上报
  meetApproval: any = []; //会议室审批
  state: any = ENV.httpurl;
  userinfo: any = {};
  userinforList: any;
  cguserinforList: any;
  httpurl: any = ENV.httpurl;
  article: any = {};
  allNum: number = 0;
  showStatus: any = true;
  signMes: any = {};
  equPurCount: number = 0;
  compoCount: number = 0;
  icaCount: number = 0;
  mcCount: number = 0;
  quCount: number = 0;
  enCount: number = 0;
  zyCount: number = 0;
  superAdmin: any;
  nowTime: any;
  hour: any;
  wfAlias: any;
  constructor(
    public helper: Helper,
    public modalCtrl: ModalController,
    public NativeService: NativeService,
    public globalData: globalData,
    public navCtrl: NavController,
    public http: HttpClient,
    private events: Events,
    private alertC: AlertController
  ) {
    this.wfAlias = "yqj_apply,yqj_apply_zx";
    this.userinforList = JSON.parse(localStorage.getItem("objectList"));
    this.cguserinforList = JSON.parse(localStorage.getItem("cgObjectList"));
    this.userinfo.picture = this.userinforList.staff.photo;
    // this.http.get(ENV.httpurl + '/api/staff/remind/' + this.userinforList['staff'].userId).subscribe(data => {
    //   if (data['remind']) {
    //     let alert = this.alertC.create({
    //       message: '当前密码为初始密码,是否前往修改密码?',
    //       buttons: [
    //         {
    //           text: '取消',
    //           handler: data => {
    //           }
    //         },
    //         {
    //           text: '确定',
    //           handler: data => {
    //             this.navCtrl.push(ChangepwdPage);
    //           }
    //         }
    //       ]
    //     });
    //     alert.present();
    //   }
    // });
  }

  ionViewDidEnter() {
    this.hour = new Date().getHours();
    if (this.hour < 9) {
      this.nowTime = "早上好,今天你刷牙了吗";
    } else if (this.hour < 12) {
      this.nowTime = "上午好,今天请继续加油吧";
    } else if (this.hour < 14) {
      this.nowTime = "中午好,你该休息一会儿了";
    } else if (this.hour < 17) {
      this.nowTime = "下午好,请继续加油吧";
    } else if (this.hour < 24) {
      this.nowTime = "晚上好,请继续抖擞起精神吧";
    }
    this.init();
    this.getInitData();
    this.helper.setIosIconBadgeNumber(0);
    this.userinforList = JSON.parse(localStorage.getItem("objectList"));
    this.userinfo.picture = this.userinforList.staff.photo;
  }
  doRefresh(refresher) {
    //动态切换
    // if(this.users.length ==3){
    //     this.users = this.user2;
    // }else{
    //     this.users = this.default_data;
    // }
    this.init()
    setTimeout(() => {
      refresher.complete();
      //toast提示
      this.NativeService.showToast("加载成功");
    }, 3000);
  }
  async getInitData() {
    let that = this;
    that.allNum = 0; //进入恢复初始值0
    // await that.init();
    await that.queryDb();
    await that.querySjMesage();
    await that.queryMeetAppro();
    await that.getCount(); //获取采购待办数量
    that.events.publish("tabs:num", that.allNum, Date.now());
  }
  async getCount() {
    var self = this;
    // self.superAdmin = _.chain(self.cguserinforList).map('roleType').includes('superAdmin').value();
    self.superAdmin = false;
    if (self.superAdmin) {
      self.equPurCount = 0;
      self.compoCount = 0;
      self.icaCount = 0;
      self.mcCount = 0;
      self.quCount = 0;
      self.enCount = 0;
      self.zyCount = 0;
    } else {
      await self
        .readUntreate(readEquPurFlowUri, equPurFlowIcaDefId, null)
        .then(data => {
          // @ts-ignore
          self.equPurCount = data;
          self.allNum = self.allNum + Number(data);
        });
      await self
        .readUntreate(readCompoFlowUri, compoFlowMcDefId, null)
        .then(data => {
          // @ts-ignore
          self.compoCount = data;
          self.allNum = self.allNum + Number(data);
        });
      await self.readUntreate(readIcaFlowUri, flowIcaDefId, null).then(data => {
        // @ts-ignore
        self.icaCount = data;
        self.allNum = self.allNum + Number(data);
      });
      await self.readUntreate(readMcFlowUri, flowMcDefId, "MC").then(data => {
        // @ts-ignore
        self.mcCount = data;
        self.allNum = self.allNum + Number(data);
      });
      await self.readUntreate(readMcFlowUri, resuQuDefId, "MCQ").then(data => {
        // @ts-ignore
        self.quCount = data;
        self.allNum = self.allNum + Number(data);
      });

      await self
        .readUntreate(entrustApplyFlowUri, entrustApplyId, null)
        .then(data => {
          // @ts-ignore
          self.enCount = data;
          self.allNum = self.allNum + Number(data);
        });
      await self.readZyDb().then(data => {
        self.zyCount = Number(data);
        self.allNum = self.allNum + Number(data);
      });
    }
  }
  readZyDb() {
    let params = {
      params: {
        page: "-1"
      }
    };
    return new Promise((resolve, reject) => {
      return this.http
        .post(
          ENV.httpurlzyscm + "/api/wfApp/queryDbNotityCountApp/" + this.wfAlias,
          {},
          params
        )
        .subscribe(
          resp => {
            resolve(resp["total"]);
          },
          error => {
            reject();
          }
        ); // 出错，返回空对象);
    });
  }
  readUntreate(uri, defIds, type) {
    var self = this;
    let params = {};
    if (type === null) {
      params = {
        params: {
          page: "-1"
        },
        observe: "response"
      };
    } else {
      params = {
        params: {
          page: "-1",
          type: type
        },
        observe: "response"
      };
    }
    return new Promise((resolve, reject) => {
      return this.http
        .post(
          ENV.httpurlscm + uri,
          self.getParamsInDetailView(_.map(defIds, id => id).join(",")),
          params
        )
        .subscribe(
          resp => {
            resolve(resp["headers"].get("count"));
          },
          error => {
            reject();
          }
        ); // 出错，返回空对象);
    });
  }
  // 流程查询参数
  getParamsInDetailView(defId) {
    return {
      bizType: "",
      flowDefId: defId,
      personalityFlowDefId: "",
      queryColumn: "",
      status: "1",
      userID: this.userinforList.loginInfo.emailWork
    };
  }
  cgsh(type) {
    this.navCtrl.push("PurchaseflowPage", { flowType: type });
  }
  //元器件
  yqj() {
    this.navCtrl.push("ZyPurchaseflowPage");
  }
  init() {
    var rightPage = {
      inters: {},
      normal: {},
      calendar: {},
      meetings: {},
      entry: {
        type: "xinwen"
      }
    };
    let that = this;
    let promise = new Promise(function (resolve, reject) {
      that.http
        .post(ENV.httpurl + "/api/homeMethod/hList", rightPage)
        .subscribe(
          data => {
            //新闻
            that.dataNewList = _.filter(
              data["inters"],
              n => n.appAvaliable === "TRUE"
            );
            //获取未读新闻消息个数
            _.map(that.dataNewList, n => {
              that.allNum = that.allNum + parseInt(n.noReadCount);
            });
            //常用应用
            that.dataShortList = data["normal"];
            that.dataSList = that.dataShortList;
            // //待办事项
            // that.dataDbList = data['dbList'];
            //日程信息
            that.dataCalList = data["calendar"];
            //会议信息
            that.dataMeetList = data["meetings"];
            //首页最新新闻
            that.article = data["entry"];
            resolve(data);
          },
          error => {
            reject(error);
          }
        );
    });
    return promise;
  }
  //待办信息
  queryDb() {
    let that = this;
    let promise = new Promise(function (resolve, reject) {
      that.http
        .post(ENV.httpurl + "/api/workflow/queryAppDb", {})
        .subscribe(data => {
          //待办事项
          that.dataDbListNew = data;
          that.dataDbList =
            that.dataDbListNew.length > 3
              ? that.dataDbListNew.slice(0, 3)
              : that.dataDbListNew;
          _.map(data, n => {
            that.allNum += parseInt(n["count"]);
          });
          resolve(data);
        });
    });
    return promise;
  }
  //数据上报待办
  querySjMesage() {
    let that = this;
    let promise = new Promise(function (resolve, reject) {
      that.http
        .get(
          ENV.httpurl +
          "/api/dateReport/queryAllMesage" +
          "/" +
          that.userinforList.staff.userId
        )
        .subscribe(data => {
          that.AllMesage = data;
          that.allNum += parseInt(that.AllMesage); //获取数据上报个数
          resolve(data);
        });
    });
    return promise;
  }
  //会议审批待办
  queryMeetAppro() {
    let that = this;
    let promise = new Promise(function (resolve, reject) {
      that.http
        .post(ENV.httpurl + "/api/meetingInfo/queryAllMeetingInfos", ["1"])
        .subscribe(
          data => {
            that.meetApproval = data;
            that.allNum += parseInt(that.meetApproval.length); //获取会议审批个数
            resolve(data);
          },
          error => {
            let hasToken = localStorage.getItem("token");
            if (hasToken == "1" || hasToken == null) {
              // 弹提示
              localStorage.setItem("token", "1"); // 会议室异常，跳到登录页
              let activeNav: NavController = this.appCtrl.getActiveNav();
              activeNav.push(LoginPage);
            } else {
              this.NativeService.showAlert("后端异常，请联系管理员.");
            }
            reject(error);
          }
        );
    });
    return promise;
  }
  presentFilter() {
    this.navCtrl.push(SettingPage);
  }
  //会议室预订情况查看 --- 预订详情列表
  goMeetingOrder() {
    this.navCtrl.parent.select(1);
  }
  //进入会议详情页面  --- 编辑页详情
  meetView(entry) {
    // this.http.get(ENV.httpurl + "/api/meetingApi/queryEntity/" + entry.id).subscribe(data => {
    this.navCtrl.push(EditorViewPage, { busId: entry.id });
    // })
  }
  //进入新闻列表详情  --- 列表详情
  goNewsList(entity) {
    let state;
    switch (entity.appUrl) {
      case "1":
        state = NewsImgPage;
        break;
      case "2":
        state = NewsTextPage;
        break;
      case "3":
        state = NewsVideoPage;
        break;
      case "4":
        state = NewsListPage;
        break;
      case null:
        state = NewsListPage;
        break;
    }
    this.navCtrl.push(state, { entity: entity });
  }
  //首页新闻详情信息  --- 编辑页详情
  viewNewsDetialFn(obj) {
    this.navCtrl.push(NewsDetailPage, { entity: obj });
  }

  //进入今日日程列表页 --- 列表详情
  goCalendarListFn() {
    this.navCtrl.parent.select(2);
  }
  //查看日程详情信息 --- 编辑页详情
  viewCal(entry) {
    if (entry.calType === "meeting") {
      //会议
      this.navCtrl.push(EditorViewPage, { busId: entry.busId });
    } else if (entry.calType === "goout") {
      //外出
    } else if (entry.calType === "leave") {
      //请假
      this.showStatus = false;
      this.http
        .get(ENV.httpurl + "/api/leaveApply/queryEntity/" + entry.busId)
        .subscribe(async data => {
          setTimeout(() => {
            this.showStatus = true;
          }, 10);
          this.navCtrl.push("VacationDraftPage", {
            entry: data,
            opeType: "view",
            ref: null
          });
        });
    } else if (entry.calType === "evection") {
    } else {
      this.navCtrl.push(SchedulePage, {
        entry: entry,
        chooseData: new Date(),
        editable: true
      });
    }
  }
  //进入待办列表 --- 更多
  goWorkflowDbListFn() {
    let cslist = {
      equPurCount: this.equPurCount,
      icaCount: this.icaCount,
      compoCount: this.compoCount,
      mcCount: this.mcCount,
      quCount: this.quCount,
      enCount: this.enCount,
      zyCount: this.zyCount
    };
    this.navCtrl.push(TodoListPage, {
      list: this.dataDbListNew,
      meet: this.meetApproval,
      sjList: this.AllMesage,
      cslist: cslist
    });
  }
  //进入常用应用更多页面 --- 更多
  goYlListFn() {
    this.navCtrl.push(YlListPage, { list: this.dataShortList });
  }

  /**
   * 常用应用点击进入
   * @param type 路由页码
   */
  goUseList(type) {
    if (!type.appUrl) {
      this.NativeService.showAlert("请联系管理员配置流程信息");
      return;
    } else if (!type.appAlias) {
      this.NativeService.showAlert("请联系管理员配置流程信息");
      return;
    } else if (type.appUrl === "IstaffadvisePage") {
      this.navCtrl.push(IstaffadvisePage); //1是新增
    } else {
      this.navCtrl.push(type.appUrl, { alias: type.appAlias, type: 1 }); //1是新增
    }
  }
  yj() {
    this.navCtrl.push(IstaffadvisePage); //1是新增
  }
  //会议审批待办列表
  meetAppro() {
    this.navCtrl.push(MeetApproPage);
  }
  //数据上报待办列表;
  dataAppro() { }
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
  // 显示合同签署：采购办合同管理员
  showHtSign() {
    var self = this;
    return _.some(self.cguserinforList, { name: "scm_contract_admin" });
  }
  // 合同签署扫描
  scan() {
    let that = this;
    this.navCtrl.push("ScanPage", {
      callback: that.scanCallBackFunction
    });
  }

  //二维码扫描完回调方法
  scanCallBackFunction = params => {
    return new Promise((resolve, reject) => {
      resolve(true);
      if (!!params) {
        let backApi = params + "?isApp=true";
        this.getSignInfo(backApi);
      }
    });
  };

  // 获取签署信息
  getSignInfo(url) {
    this.http.get(url).subscribe(
      resp => {
        let data = resp;
        this.signMes.htType = data["type"];
        this.transSign(data);
      },
      error => console.log(error)
    );
  }

  // 组装签署的数据
  transSign(data) {
    var self = this;
    self.signMes.showSignInfo = false;
    self.signMes.editableSign = false;
    self.http
      .post(
        ENV.httpurlscm + "/api/contractSigning/findByCaCode/" + data.caCode,
        {}
      )
      .subscribe(resp => {
        console.log(resp);
        self.signMes.signInfo = resp;
        if (resp["id"]) {
          self.signMes.signInfo = resp;
        } else {
          if (data && data.contractEntry) {
            self.signMes.showSignInfo = true;
            self.signMes.editableSign = true;
            this.getStaffByUserId(data.contractEntry.applicant).then(resp => {
              if (resp) {
                self.signMes.signInfo.proposer = resp["userName"];
                console.log(self.signMes.signInfo.proposer);
              }
            });
          }
          self.signMes.signInfo.caCode = data.contractEntry.caCode;
          self.signMes.signInfo.signingDate = new Date();
        }
        let profileModal = this.modalCtrl.create("SignModelPage", {
          signMes: this.signMes
        });
        profileModal.onDidDismiss(data => {
          if (data && data == "close") {
            this.signMes.htType = null;
            this.signMes.noteMsg = null;
            this.signMes.signSuccessMsg = null;
            this.signMes.showSignInfo = null;
            this.signMes.signInfo = null;
            //this.scan();
          } else if (data && data != "close") {
            this.signMes = data;
          }
        });
        profileModal.present();
      });
  }

  //根据userId获取用户信息
  getStaffByUserId(userId) {
    return new Promise((resolve, reject) => {
      return this.http
        .get(ENV.httpurlscm + "/api/staff/getStaffInfoByUserid/" + userId)
        .subscribe(
          data => {
            resolve(data);
          },
          error => {
            reject(error);
          }
        );
    });
  }
}
