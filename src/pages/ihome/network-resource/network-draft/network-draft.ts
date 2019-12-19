import { Component, ViewChild } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  AlertController,
  ModalController,
  Events
} from "ionic-angular";
import { globalData } from "../../../../icommon/provider/globalData";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs/Rx";
import { ENV } from "@env/environment";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { NativeService } from "../../../../icommon/provider/native";
import _ from "lodash";
import {
  saveEntityUri5,
  wfAlias5,
  wfAlia5
} from "../../../../icommon/provider/Constants";

@IonicPage()
@Component({
  selector: "page-network-draft",
  templateUrl: "network-draft.html"
})
export class NetworkDraftPage {
  userinfor: any;
  editable: any;
  editingEntry: any = {};
  //表单
  myForm: FormGroup;
  //附件列表信息
  fileList: any;
  @ViewChild("uploadImg") uploadImg: any;
  //流程信息
  wfAlias: any;
  wfHolderObj: any;
  btns: any;
  isTodo: any;
  //
  userTypes: any;
  businessTypes: any;
  delays: any;
  roomAddress: any;
  accessTypes: any;
  purposeTypes: any;
  assetsTypes: any;
  opeType: any;
  vpnList: any = [
    {
      value: "arpxt",
      name:
        "ARP系统、公共资源（内部信息发布平台、质量信息平台、航天科技报告系统、标准全文数据库系统、电子培训平台等）"
    },
    { value: "erpxt", name: "ERP系统" },
    { value: "ktjfcxxt", name: "课题经费查询系统" }
  ];
  vpnTypes: any = [];
  //页面所需接口
  httpurl: any = ENV.httpurl;
  toggle: any;
  constructor(
    public modalCtrl: ModalController,
    public NativeService: NativeService,
    public alertCtrl: AlertController,
    public fb: FormBuilder,
    public http: HttpClient,
    public globalData: globalData,
    public navCtrl: NavController,
    public navParams: NavParams,
    private events: Events
  ) {
    this.userinfor = JSON.parse(localStorage.getItem("objectList"));
    this.editable = this.navParams.get("opeType") === "view" ? false : true;
    this.opeType = this.navParams.get("opeType") === "cre" ? true : false;
    this.toggle = this.navParams.get("toggle");
    this.myForm = this.fb.group({
      opinion: ["", [Validators.required]]
    });
    this.getTypes();
    if (this.navParams.get("opeType") === "cre") {
      // 创建
      Object.assign(this.editingEntry, {
        userId: this.userinfor.loginInfo.userId,
        userName: this.userinfor.loginInfo.userName,
        operatorId: this.userinfor.loginInfo.userId, //经办人id
        operatorName: this.userinfor.loginInfo.userName, //经办人name
        deptId: this.userinfor.deptTo.deptId, //创建人部门ID
        deptName: this.userinfor.deptTo.deptName, //创建人部门名
        // applyDeptid: this.userinfor.deptTo.deptId, //经办人部门ID
        operatorDeptName: this.userinfor.deptTo.deptName, //经办人部门名
        applyUserid: this.userinfor.loginInfo.userId, //申请人id
        applyUsername: this.userinfor.loginInfo.userName, //申请人name
        applyDeptname: this.userinfor.deptTo.deptName, //申请人部门名
        applyPhoneNumber: this.userinfor.loginInfo.mobNum, //申请人手机号码
        orgId: this.userinfor.staff.corpOrgId, //机构ID
        orgName: this.userinfor.deptTo.deptName, // 机构名称
        corpOrgId: this.userinfor.staff.corpOrgId, // 法人机构ID
        corpOrgName: this.userinfor.deptTo.deptName, // 法人机构名称
        phoneNumber: this.userinfor.loginInfo.mobNum,
        applyDate: new Date(),
        procedureStatus: "draft",
        createTime: new Date()
      });
      let normalDate = new Date();
      this.editingEntry.applyDateNew = this.getDate(normalDate);
      this.editingEntry.delayStartTimeNew = this.getDate(normalDate);
      this.editingEntry.delayEndTimeNew = this.getDate(normalDate);
    } else {
      this.editingEntry = this.navParams.get("entry");

      this.editingEntry.updateId = this.userinfor.loginInfo.userId;
      this.editingEntry.updateName = this.userinfor.loginInfo.userName;
      this.editingEntry.updateTime = new Date();

      if (!!this.editingEntry.applyDate) {
        this.editingEntry["applyDateNew"] = this.getDate(
          this.editingEntry["applyDate"]
        );
      }
      if (!!this.editingEntry.delayStartTime) {
        this.editingEntry["delayStartTimeNew"] = this.getDate(
          this.editingEntry["delayStartTime"]
        );
      }
      if (!!this.editingEntry.delayEndTime) {
        this.editingEntry["delayEndTimeNew"] = this.getDate(
          this.editingEntry["delayEndTime"]
        );
      }
      if (!!this.editingEntry.delay) {
        this.editingEntry.delayName = this.editingEntry.delay;
      }

      if (!!this.editingEntry.businessType) {
        this.editingEntry.businessTypeName = this.editingEntry.businessType.split(
          ","
        );
      }
      if (!!this.editingEntry.accessType) {
        this.editingEntry.accessTypeName = this.editingEntry.accessType.split(
          ","
        );
      }
      if (!!this.editingEntry.assetsType) {
        this.editingEntry.assetsTypeName = this.editingEntry.assetsType.split(
          ","
        );
      }
      if (!!this.editingEntry.roomAddress) {
        this.editingEntry.roomAddressName = this.editingEntry.roomAddress.split(
          ","
        );
      }
      if (!!this.editingEntry.purpose) {
        this.editingEntry.purposeName = this.editingEntry.purpose;
      }
      if (!!this.editingEntry.vpnType) {
        this.vpnTypes = this.editingEntry.vpnType.split(",");
      }
    }
  }
  getDate(date) {
    let normalDate = new Date(date);
    let time =
      normalDate.getFullYear() +
      "-" +
      (normalDate.getMonth() + 1) +
      "-" +
      normalDate.getUTCDate() +
      " " +
      normalDate.getHours() +
      ":" +
      normalDate.getUTCMinutes() +
      ":" +
      normalDate.getUTCSeconds();
    return new Date(
      new Date(Date.parse(time.replace(/-/g, "/"))).getTime() +
        8 * 60 * 60 * 1000
    ).toISOString();
  }
  ionViewDidEnter() {
    this.wfHolder();
  }
  // 获取工作流配置、实例信息
  wfHolder() {
    var flowName = "";
    if (
      this.editingEntry.userType == "lp" ||
      this.editingEntry.userType == "qt"
    ) {
      flowName = wfAlias5;
    } else {
      flowName = wfAlia5;
    }
    this.globalData
      .getHolderFromWfAliasRef(flowName, this.navParams.get("ref"), null)
      .subscribe(async data => {
        this.wfHolderObj = this.globalData.compOtherInfo(data);
        this.btns = this.wfHolderObj.btns();
        this.isTodo = this.wfHolderObj.isTodo();
        this.globalData.setProc(this.wfHolderObj.btns());
      });
  }
  getTypes() {
    this.http
      .get(
        ENV.httpurl +
          "/api/dictOption/queryDictOptionFindByDictCode/BLQY_NETWORKRESOURCE_USERTYPE"
      )
      .subscribe(data => {
        this.userTypes = data;
      });

    this.http
      .get(
        ENV.httpurl +
          "/api/dictOption/queryDictOptionFindByDictCode/BLQY_NETWORKRESOURCE_DELAY"
      )
      .subscribe(data => {
        this.delays = data;
      });
    this.http
      .get(
        ENV.httpurl +
          "/api/dictOption/queryDictOptionFindByDictCode/BLQY_NETWORKRESOURCE_BUSINESSTYPE"
      )
      .subscribe(data => {
        this.businessTypes = data;
      });
    this.http
      .get(
        ENV.httpurl +
          "/api/dictOption/queryDictOptionFindByDictCode/BLQY_NETWORKRESOURCE_ROOMTYPE"
      )
      .subscribe(data => {
        this.roomAddress = data;
      });
    this.http
      .get(
        ENV.httpurl +
          "/api/dictOption/queryDictOptionFindByDictCode/BLQY_NETWORKRESOURCE_ACCESSTYPE"
      )
      .subscribe(data => {
        this.accessTypes = data;
      });
    this.http
      .get(
        ENV.httpurl +
          "/api/dictOption/queryDictOptionFindByDictCode/BLQY_NETWORKRESOURCE_PURPOSETYPE"
      )
      .subscribe(data => {
        this.purposeTypes = data;
      });
    this.http
      .get(
        ENV.httpurl +
          "/api/dictOption/queryDictOptionFindByDictCode/BLQY_NETWORKRESOURCE_ASSETSTYPE"
      )
      .subscribe(data => {
        this.assetsTypes = data;
      });
  }

  // 流程处理
  manage = _.throttle(function(btn) {
    let self = this;
    if (!this.editingEntry.userType) {
      this.NativeService.showAlert("请选择人员类别！");
      return;
    } else if (
      !!this.editingEntry.userType &&
      this.editingEntry.userType == "lp"
    ) {
      if (!this.editingEntry.delayName) {
        this.NativeService.showAlert("请选择申请类型！");
        return;
      } else if (!this.editingEntry.remarks) {
        this.NativeService.showAlert("请备注中填写邮箱账号、IP地址信息！");
        return;
      }
    } else if (
      !!this.editingEntry.userType &&
      this.checkPeople("qt") &&
      !this.editingEntry.remarks
    ) {
      this.NativeService.showAlert("请在备注处对该人员类别进行说明！");
      return;
    }
    if (!this.editingEntry.phoneNumber) {
      this.NativeService.showAlert("请填写联系电话！");
      return;
    }
    if (!this.editingEntry.applyUsername) {
      this.NativeService.showAlert("请选择申请人！");
      return;
    }
    if (!this.editingEntry.applyDeptname) {
      this.NativeService.showAlert("请选择申请人所在部门！");
      return;
    }
    if (!this.editingEntry.applyPhoneNumber) {
      this.NativeService.showAlert("请选择申请人手机号码！");
      return;
    }
    if (!this.editingEntry.businessTypeName) {
      this.NativeService.showAlert("请选择业务类型！");
      return;
    }
    if (
      !!this.editingEntry.businessTypeName &&
      _.includes(this.editingEntry.businessTypeName, "ip")
    ) {
      if (
        !this.editingEntry.roomAddressName ||
        !this.editingEntry.roomNum ||
        !this.editingEntry.purposeName ||
        !this.editingEntry.switchBoardModel ||
        !this.editingEntry.assetsLabel ||
        !this.editingEntry.secrecyLabel ||
        !this.editingEntry.accessTypeName ||
        !this.editingEntry.assetsTypeName ||
        !this.editingEntry.macAddress
      ) {
        this.NativeService.showAlert("请完善IP地址申请信息！");
        return;
      }
      let reg_name = /([A-Fa-f0-9]{2}-){5}[A-Fa-f0-9]{2}/;
      if (!reg_name.test(this.editingEntry.macAddress)) {
        this.NativeService.showAlert("请输入正确的MAC地址!");
        return;
      }
    }
    if (this.opeType && !this.editingEntry.checked) {
      this.NativeService.showAlert("请阅读用户协议！");
      return;
    }

    switch (this.toggle) {
      case "awiatData":
        this.events.publish("tabs:awiatData", this.toggle, "");
        break;
      case "complateData":
        this.events.publish("tabs:complateData", this.toggle, "");
        break;
      case "AllData":
        this.events.publish("tabs:AllData", this.toggle, "");
        break;
    }
    btn.proc(
      this.myForm.value.opinion,
      () => self.sureSub(),
      () => self.getWfData(),
      () => self.lastDo(),
      () => self.beforeSelectRes(),
      selected => self.afterSelectRes(selected),
      () => self.getNextPoint(),
      () => self.procBackPoint()
    );
  }, 800);
  // 选人之前处理，没有什么处理时，可以不写返回值
  beforeSelectRes() {
    return {};
  }
  procBackPoint() {
    return {};
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
  // 检验MAC地址

  blurInputTag() {
    let reg_name = /([A-Fa-f0-9]{2}-){5}[A-Fa-f0-9]{2}/;
    if (!reg_name.test(this.editingEntry.macAddress)) {
      this.NativeService.showToast("请输入正确的MAC地址!");
    }
  }
  // 保存业务表数据
  sureSub(): Observable<any> {
    return Observable.create(observer => {
      let self = this;
      if (!!this.editingEntry.delayName) {
        this.editingEntry.delay = this.editingEntry.delayName;
      }
      if (!!this.editingEntry.businessTypeName) {
        this.editingEntry.businessType = this.editingEntry.businessTypeName.join(
          ","
        );
      }
      if (
        !!this.editingEntry.businessTypeName &&
        _.includes(this.editingEntry.businessTypeName, "ip")
      ) {
        if (!!this.editingEntry.roomAddressName) {
          this.editingEntry.roomAddress = this.editingEntry.roomAddressName;
          // this.editingEntry.roomAddress = this.editingEntry.roomAddressName.join(',');
        }
        if (!!this.editingEntry.accessTypeName) {
          this.editingEntry.accessType = this.editingEntry.accessTypeName;
        }
        if (!!this.editingEntry.purposeName) {
          this.editingEntry.purpose = this.editingEntry.purposeName;
        }
        if (!!this.editingEntry.assetsTypeName) {
          this.editingEntry.assetsType = this.editingEntry.assetsTypeName.join(
            ","
          );
        }
      }
      if (!!this.vpnTypes) {
        this.editingEntry.vpnType = this.vpnTypes.join(",");
      }

      let de = new Date(this.editingEntry.applyDateNew);
      let dt = new Date(this.editingEntry.delayStartTimeNew);
      let et = new Date(this.editingEntry.delayEndTimeNew);

      this.editingEntry.applyDate = new Date(de.getTime() - 8 * 60 * 60 * 1000);
      this.editingEntry.delayStartTime = new Date(
        dt.getTime() - 8 * 60 * 60 * 1000
      );
      this.editingEntry.delayEndTime = new Date(
        et.getTime() - 8 * 60 * 60 * 1000
      );

      return self.http
        .post(ENV.httpurl + saveEntityUri5, self.editingEntry)
        .subscribe(
          resp => {
            self.editingEntry.id = resp["id"]; // 将id重置回去，为了wfData获取数据
            observer.next(resp["businessKey"]); // 在流程提交组件里获取
          },
          error => {
            this.NativeService.hideLoading();
            observer.error(false);
          }
        );
    });
  }
  // 暂存（有流程）/保存（无流程）
  saveAndReturn = _.throttle(function() {
    // if (!!this.editingEntry.businessTypeName && _.includes(this.editingEntry.businessTypeName, 'ip')) {
    //     let reg_name=/([A-Fa-f0-9]{2}-){5}[A-Fa-f0-9]{2}/;
    //     if(!reg_name.test(this.editingEntry.macAddress)){
    //         this.NativeService.showAlert("请输入正确的MAC地址!")
    //         return;
    //     }
    // }
    this.NativeService.showLoading();
    this.sureSub().subscribe(
      data => {
        this.NativeService.hideLoading();
        switch (this.toggle) {
          case "awiatData":
            this.events.publish("tabs:awiatData", this.toggle, "");
            break;
          case "complateData":
            this.events.publish("tabs:complateData", this.toggle, "");
            break;
          case "AllData":
            this.events.publish("tabs:AllData", this.toggle, "");
            break;
        }
        this.navCtrl.pop();
      },
      error => {
        this.NativeService.hideLoading();
      }
    );
  }, 800);
  // 获取保存到流程实例workflowInstData字段中的数据，建议保存关联键（主键id）
  getWfData() {
    return { bizId: this.editingEntry.id };
  }
  openModal() {
    this.editingEntry.checked = true;
    let modal = this.modalCtrl.create("ModalContentPage");
    modal.present();
  }

  //选择参会人员
  selectPerson() {
    this.navCtrl.push("SelectPeopleNewPage", {
      callback: this.staffBackFunction,
      userId: this.editingEntry.applyUserid
    });
  }
  //人员信息对应
  staffBackFunction = params => {
    return new Promise((resolve, reject) => {
      if (typeof params != "undefined") {
        resolve("ok");
        if (!!params.data) {
          this.editingEntry.applyUserid = params.data[0].userId;
          this.editingEntry.applyUsername = params.data[0].userName;
          this.editingEntry.applyDeptid = params.data[0].orgId;
          this.editingEntry.applyDeptname = params.data[0].deptName;
          this.editingEntry.applyPhoneNumber = params.data[0].mobile;
        }
      } else {
        reject(Error("error"));
      }
    });
  };
  //判断是否显示
  checkShow(type) {
    if (!!this.editingEntry.businessTypeName) {
      return _.includes(this.editingEntry.businessTypeName, type);
    } else {
      return false;
    }
  }

  checkPeople(type) {
    if (!!this.editingEntry.userType) {
      return _.includes(this.editingEntry.userType, type);
    } else {
      return false;
    }
  }

  vpnCheckboxClick(value) {
    let index = this.vpnTypes.indexOf(value);
    if (index === -1) {
      this.vpnTypes.push(value);
    } else {
      this.vpnTypes.splice(index, 1);
    }
  }
  goback() {
    this.navCtrl.pop();
  }
}
