import { NativeService } from "../../../../icommon/provider/native";
import { Component } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  AlertController,
  ModalController
} from "ionic-angular";
import { HttpClient } from "@angular/common/http";
import _ from "lodash";
import { ENV } from "@env/environment";
import { zyglobalData } from "../../../../icommon/provider/zyglobalData";
import { Observable } from "rxjs/Rx";
import { fileSearchUri } from "../../../../icommon/provider/Constantscg";
import "rxjs/add/operator/timeout";
import { Events } from "ionic-angular";
import { Keyboard } from "@ionic-native/keyboard";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
/**
 * Generated class for the CompopurappliPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-zy-compopurappli",
  templateUrl: "zy-compopurappli.html"
})
export class ZyCompopurappliPage {
  userinfor: any = {};
  editable: boolean = false;
  entry: any = {};
  flowType: any;
  httpurl: any;
  opinionList: any = [];
  editingEntry: any = {};
  point: any = {};
  cdUserName: any;
  cbUserName: any;
  draftsUserName: any;
  draftsUserName2: any;
  currAmounts: any = {};
  fileList: any = [];
  singleSourceFileList: any = [];
  lockfileds: any;
  tenderRecordList: any = [];
  draftingDeptList: any = [];
  purchaseWayList: any = [];
  purchaseSourceList: any = [];
  purchaseTypeList: any = [];
  dataInformations: any = [];
  totalAll: any;
  maxTotalAll: any;
  detailInformations: any = [];
  _bizParams: any;
  hjenty: any = {};
  points: any = [];
  len: any;
  currentPoint: any;
  lastPoint: any;
  firstPoint: any;
  nextPoint: any;
  buttons: any = [];
  OPINION_TITLE: any;
  datamore: any = {};
  toggle: any;
  //流程信息
  wfHolderObj: any;
  isTodo: any;
  btns: any;
  ismobile: boolean = false;
  opinion_title: any = "";
  //表单
  myForm: FormGroup;
  productStages: any;
  purchaseTypes: any;
  purchaseWays: any;
  payTypes: any;
  commonTypes: any;
  constructor(
    private events: Events,
    private keyboard: Keyboard,
    public modalCtrl: ModalController,
    public zyglobalData: zyglobalData,
    public NativeService: NativeService,
    public http: HttpClient,
    private alerCtrl: AlertController,
    public navCtrl: NavController,
    public navParams: NavParams,
    public fb: FormBuilder
  ) {
    this.opinion_title = "同意";
    this.userinfor = JSON.parse(localStorage.getItem("objectList"));
    this.editable = this.navParams.get("opeType") == "view" ? false : true;
    this.editingEntry = this.navParams.get("entry");
    this.toggle = this.navParams.get("toggle");
    if (this.NativeService.isAndroid()) {
      this.ismobile = true;
    }
    this.myForm = this.fb.group({
      opinion: ["同意", [Validators.required]]
    });
  }
  goback() {
    this.navCtrl.pop();
  }
  ionViewDidEnter() {
    this.getTypes();
    this.getEditingEntry();
    this.httpurl = ENV.httpurlzyscm;
    this.wfHolder();

    this.keyboard.onKeyboardWillHide().subscribe(data => {
      if (this.NativeService.isAndroid()) {
        this.datamore.btnscroll = false;
        this.datamore.btnscollHeight = 0;
      }
    });
  }
  //获取工作流配置信息，实例信息
  wfHolder() {
    let that = this;
    if (!!this.navParams.get("wfAlias")) {
      this.zyglobalData
        .getHolderFromWfAliasRef(
          this.navParams.get("wfAlias"),
          this.navParams.get("ref"),
          null
        )
        .subscribe(async data => {
          this.wfHolderObj = this.zyglobalData.compOtherInfo(data);
          this.isTodo = this.wfHolderObj.isTodo();
          this.btns = this.wfHolderObj.btns(); //获取按钮
          this.zyglobalData.setProc(this.wfHolderObj.btns()); //给按钮设置函数
          await that.getOptionAll(this.wfHolderObj);
        });
    }
  }
  //获取详情信息
  getEditingEntry() {
    this.http
      .get(ENV.httpurlzyscm + "/api/wfApp/getEntry/" + this.navParams.get("id"))
      .subscribe(async data => {
        this.editingEntry = data;
        let dictOpts = [
          {
            dict: "SYS_COMPONENT_COMMONTYPE",
            orgField: "commonType",
            destField: "commonTypeName"
          }
        ];
        this.zyglobalData.transformDict(
          dictOpts,
          this.editingEntry.entryDetail,
          "oa"
        );
      });
  }
  //获取办理意见列表（1、获取工作流配置、实例信息得到wfHolder）
  getOptionAll(wfHolderObj) {
    this.opinionList = this.zyglobalData.getOpinions(wfHolderObj);
  }

  //获取附件信息
  getFileList() {
    this.http
      .get(
        ENV.httpurlzyscm +
          fileSearchUri +
          this.editingEntry.bizEntity.id +
          "/file"
      )
      .subscribe(data => {
        this.fileList = data;
      });
  }
  viewFlow() {
    this.navCtrl.push("ZyWorkFlowPage", {
      wfAlias: this.navParams.get("wfAlias"),
      ref: this.navParams.get("ref")
    });
  }

  blurInput() {
    let that = this;
    that.datamore.btnscroll = true;
    this.keyboard.onKeyboardShow().subscribe(data => {
      if (that.NativeService.isAndroid()) {
        that.datamore.btnscollHeight = data.keyboardHeight;
      }
    });
    if (that.datamore.btnscollHeight > 0) {
    } else {
      that.datamore.btnscollHeight = 267;
    }
  }

  getTypes() {
    //任务阶段
    this.http
      .get(
        ENV.httpurlzyscm +
          "/api/dictOption/queryDictOptionFindByDictCode/SYS_COMPONENT_PRODUCT_STAGE"
      )
      .subscribe(data => {
        this.productStages = data;
      });
    //采购来源：
    this.http
      .get(
        ENV.httpurlzyscm +
          "/api/dictOption/queryDictOptionFindByDictCode/SYS_COMPONENT_NEW_IMPORT"
      )
      .subscribe(data => {
        this.purchaseTypes = data;
      });
    //采购方式：
    this.http
      .get(
        ENV.httpurlzyscm +
          "/api/dictOption/queryDictOptionFindByDictCode/SYS_COMPONENT_PURCHASE_WAY"
      )
      .subscribe(data => {
        this.purchaseWays = data;
      });
    //付款方式
    this.http
      .get(
        ENV.httpurlzyscm +
          "/api/dictOption/queryDictOptionFindByDictCode/SYS_COMPONENT_PAY_TYPE"
      )
      .subscribe(data => {
        this.payTypes = data;
      });
    //
    this.http
      .get(
        ENV.httpurlzyscm +
          "/api/dictOption/queryDictOptionFindByDictCode/SYS_COMPONENT_COMMONTYPE"
      )
      .subscribe(data => {
        this.commonTypes = data;
      });
  }

  // 流程处理
  manage = _.throttle(function(btn) {
    let self = this;
    if (self.opinion_title.length == 0) {
      self.NativeService.showAlert("请填写办理意见！");
      return;
    }
    this.NativeService.showLoading();
    btn.proc(
      self.opinion_title,
      () => self.save(),
      () => self.getWfData(),
      () => self.lastDo(),
      () => self.beforeSelectRes(),
      selected => self.afterSelectRes(selected),
      () => self.getNextPoint(),
      () => self.procBackPoint()
    );
  }, 800);
  // 保存业务表数据
  save(): Observable<any> {
    return Observable.create(observer => {
      var self = this;
      return self.http
        .post(
          ENV.httpurlzyscm + "/api/wfApp/saveOrUpdate",
          self.editingEntry.entry
        )
        .subscribe(
          resp => {
            self.editingEntry["id"] = resp["id"]; // 将id重置回去，为了wfData获取数据
            observer.next(resp["businessKey"]); // 在流程提交组件里获取
          },
          error => {
            this.NativeService.hideLoading();
            observer.error(false);
          }
        );
    });
  }
  getWfData() {}
  // 选人之前处理，没有什么处理时，可以不写返回值
  beforeSelectRes() {
    return {};
  }
  procBackPoint() {
    this.navCtrl.pop(); // 流程提交后 返回的页面
    // return {}
  }
  // 选人之后处理
  afterSelectRes(selected) {
    console.debug("选择的人....", selected);
  }
  // 获取下一环节，默认提交给下一环节，可以不写返回值
  getNextPoint() {}
  // 提交流程后的操作
  lastDo() {
    this.NativeService.hideLoading();
    this.navCtrl.pop(); // 流程提交后 返回的页面
  }
}
