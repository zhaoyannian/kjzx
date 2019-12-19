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
import { fhqEditMxPage } from "./eidtDraftfhq";

import _ from "lodash";
import {
  saveEntityUri10,
  wfAlias10,
  uploadFileUri,
  queryListFileUri,
  uuid
} from "../../../../icommon/provider/Constants";

@IonicPage()
@Component({
  selector: "page-service-draft",
  templateUrl: "service-draft.html"
})
export class ServiceDraftPage {
  fhqEditMxPage = fhqEditMxPage;
  userinfor: any;
  editable: any;
  editingEntry: any = {};
  //表单
  myForm: FormGroup;
  //上传网络带宽附件列表信息
  wffileList: any = [];
  //上传网络带宽附件列表信息
  kdfileList: any = [];
  //上传视频会议附件列表信息
  videofileList: any = [];
  //防火墙删除最后一条
  max: any = [];
  totalDate: any = 0;
  branchId: any = 0;
  branchName: any = 0;

  @ViewChild("uploadImg") uploadImg: any;
  //流程信息
  wfAlias: any;
  wfHolderObj: any;
  btns: any;
  isTodo: any;
  //
  userTypes: any;
  webServiceTypes: any;
  isDoubleFlows: any;
  opeType: any;
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
        createTime: new Date(),
        firewallPortServices: []
      });
      let normalDate = new Date();
      this.editingEntry.applyDateNew = this.getDate(normalDate);
      this.editingEntry.wifiTimeNew = this.getDate(normalDate);
      this.editingEntry.wifiEndTimeNew = this.getDate(normalDate);
      this.editingEntry.videoTimeNew = this.getDate(normalDate);
      this.editingEntry.testTimeNew = this.getDate(normalDate);
      this.editingEntry.kdTimeNew = this.getDate(normalDate);
      this.editingEntry.kdEndTimeNew = this.getDate(normalDate);
    } else {
      this.editingEntry = this.navParams.get("entry");

      this.editingEntry.updateId = this.userinfor.loginInfo.userId;
      this.editingEntry.updateName = this.userinfor.loginInfo.userName;
      this.editingEntry.updateTime = new Date();

      if (!!this.editingEntry["filesId"]) {
        this.queryListFile(this.editingEntry["filesId"], "wift");
      }

      if (!!this.editingEntry["kdFilesId"]) {
        this.queryListFile(this.editingEntry["kdFilesId"], "kd");
      }

      if (!!this.editingEntry["videoFileId"]) {
        this.queryListFile(this.editingEntry["videoFileId"], "video");
      }

      if (!!this.editingEntry.applyDate) {
        this.editingEntry["applyDateNew"] = this.getDate(
          this.editingEntry["applyDate"]
        );
      }
      if (!!this.editingEntry.wifiTime) {
        this.editingEntry["wifiTimeNew"] = this.getDate(
          this.editingEntry["wifiTime"]
        );
      }
      if (!!this.editingEntry.wifiEndTime) {
        this.editingEntry["wifiEndTimeNew"] = this.getDate(
          this.editingEntry["wifiEndTime"]
        );
      }
      if (!!this.editingEntry.videoTime) {
        this.editingEntry["videoTimeNew"] = this.getDate(
          this.editingEntry["videoTime"]
        );
      }

      if (!!this.editingEntry.testTime) {
        this.editingEntry["testTimeNew"] = this.getDate(
          this.editingEntry["testTime"]
        );
      }

      if (!!this.editingEntry.kdTime) {
        this.editingEntry["kdTimeNew"] = this.getDate(
          this.editingEntry["kdTime"]
        );
      }

      if (!!this.editingEntry.kdEndTime) {
        this.editingEntry["kdEndTimeNew"] = this.getDate(
          this.editingEntry["kdEndTime"]
        );
      }

      if (!!this.editingEntry.webServiceType) {
        this.editingEntry.webServiceName = this.editingEntry.webServiceType.split(
          ","
        );
      }
      if (!!this.editingEntry.isDoubleFlow) {
        this.editingEntry.isDoubleFlowName = this.editingEntry.isDoubleFlow;
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
    this.globalData
      .getHolderFromWfAliasRef(wfAlias10, this.navParams.get("ref"), null)
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
          "/api/dictOption/queryDictOptionFindByDictCode/SYSTEM_BOOLEAN_STATE"
      )
      .subscribe(data => {
        this.isDoubleFlows = data;
      });
    this.http
      .get(
        ENV.httpurl +
          "/api/dictOption/queryDictOptionFindByDictCode/BLQY_WEBSERVICE_TYPE"
      )
      .subscribe(data => {
        this.webServiceTypes = data;
      });
  }

  // 流程处理
  manage = _.throttle(function(btn) {
    let self = this;

    if (!this.editingEntry.applyUsername) {
      this.NativeService.showAlert("请选择申请人！");
      return;
    }
    if (!this.editingEntry.phoneNumber) {
      this.NativeService.showAlert("请填写联系电话！");
      return;
    }
    if (!this.editingEntry.webServiceName) {
      this.NativeService.showAlert("请选择网络服务类型！");
      return;
    }

    if (!!this.editingEntry.webServiceName && !!this.checkShow("fhq")) {
      if (this.editingEntry.firewallPortServices.length <= 0) {
        this.NativeService.showAlert("请点击添加防火墙端口服务明细！");
        return;
      }
    }
    if (!!this.editingEntry.webServiceName && !!this.checkShow("wifi")) {
      if (!this.editingEntry.wifiMeeting) {
        this.NativeService.showAlert("请填写无线网公共帐号服务会议主题！");
        return;
      }
      if (this.editingEntry.wifiTimeNew > this.editingEntry.wifiEndTimeNew) {
        this.NativeService.showAlert("会议开始时间不能大于结束时间！");
        return;
      }
    }

    if (!!this.editingEntry.webServiceName && !!this.checkShow("video")) {
      if (!this.editingEntry.videoMeeting) {
        this.NativeService.showAlert("请填写视频会议服务会议主题！");
        return;
      }

      if (
        !this.editingEntry.testPeople ||
        !this.editingEntry.testTel ||
        !this.editingEntry.mainMeetingPlace ||
        !this.editingEntry.branchMeetingPlace
      ) {
        this.NativeService.showAlert("视频会议申请信息填写不完整！");
        return;
      }
      if (!this.editingEntry.isDoubleFlowName) {
        this.NativeService.showAlert("请选择是否双流！");
        return;
      }
    }

    if (!!this.editingEntry.webServiceName && !!this.checkShow("kd")) {
      if (this.editingEntry.kdTimeNew > this.editingEntry.kdEndTimeNew) {
        this.NativeService.showAlert("会议开始时间不能大于结束时间！");
        return;
      }
      if (!this.editingEntry.reason) {
        this.NativeService.showAlert("请填写保障原因！");
        return;
      }

      if (!this.editingEntry.service) {
        this.NativeService.showAlert("请填写保障IP或者服务！");
        return;
      }
    }

    if (!!this.editingEntry.webServiceName && !!this.checkShow("qt")) {
      if (!this.editingEntry.remarks) {
        this.NativeService.showAlert("请填写备注信息！");
        return;
      }
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
    this.NativeService.showLoading();
    this.editingEntry.filesId =
      !!this.wffileList && this.wffileList.length > 0
        ? _.map(this.wffileList, "id").join(",")
        : null;
    this.editingEntry.kdFilesId =
      !!this.kdfileList && this.kdfileList.length > 0
        ? _.map(this.kdfileList, "id").join(",")
        : null;

    this.editingEntry.videoFileId =
      !!this.videofileList && this.videofileList.length > 0
        ? _.map(this.videofileList, "id").join(",")
        : null;

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
    // let reg_name=/([A-Fa-f0-9]{2}-){5}[A-Fa-f0-9]{2}/;
    // if(!reg_name.test(this.editingEntry.macAddress)){
    //     this.NativeService.showToast("请输入正确的MAC地址!")
    // }
  }
  // 保存业务表数据
  sureSub(): Observable<any> {
    return Observable.create(observer => {
      let self = this;
      if (!!this.editingEntry.webServiceName) {
        this.editingEntry.webServiceType = this.editingEntry.webServiceName.join(
          ","
        );
      }
      if (!!this.editingEntry.webServiceName) {
        if (!!this.editingEntry.isDoubleFlowName) {
          this.editingEntry.isDoubleFlow = this.editingEntry.isDoubleFlowName;
        }
      }

      let de = new Date(this.editingEntry.applyDateNew);
      let wt = new Date(this.editingEntry.wifiTimeNew);
      let wet = new Date(this.editingEntry.wifiEndTimeNew);
      let vt = new Date(this.editingEntry.videoTimeNew);
      let tt = new Date(this.editingEntry.testTimeNew);
      let kt = new Date(this.editingEntry.kdTimeNew);
      let ket = new Date(this.editingEntry.kdEndTimeNew);

      this.editingEntry.applyDate = new Date(de.getTime() - 8 * 60 * 60 * 1000);
      this.editingEntry.wifiTime = new Date(wt.getTime() - 8 * 60 * 60 * 1000);
      this.editingEntry.wifiEndTime = new Date(
        wet.getTime() - 8 * 60 * 60 * 1000
      );
      this.editingEntry.videoTime = new Date(vt.getTime() - 8 * 60 * 60 * 1000);
      this.editingEntry.testTime = new Date(tt.getTime() - 8 * 60 * 60 * 1000);
      this.editingEntry.kdTime = new Date(kt.getTime() - 8 * 60 * 60 * 1000);
      this.editingEntry.kdEndTime = new Date(
        ket.getTime() - 8 * 60 * 60 * 1000
      );

      return self.http
        .post(ENV.httpurl + saveEntityUri10, self.editingEntry)
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
    this.NativeService.showLoading();
    this.editingEntry.filesId =
      !!this.wffileList && this.wffileList.length > 0
        ? _.map(this.wffileList, "id").join(",")
        : null;
    this.editingEntry.kdFilesId =
      !!this.kdfileList && this.kdfileList.length > 0
        ? _.map(this.kdfileList, "id").join(",")
        : null;
    this.editingEntry.videoFileId =
      !!this.videofileList && this.videofileList.length > 0
        ? _.map(this.videofileList, "id").join(",")
        : null;

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
  //选择test人员

  selectTestPerson() {
    this.navCtrl.push("SelectPeopleNewPage", {
      callback: this.testStaffBackFunction,
      userId: this.editingEntry.testPeopleId
    });
  }

  selectMainMeetingPlace() {
    this.navCtrl.push("SelectRoomPage", {
      callback: this.mainMeetingBackFunction,
      id: this.editingEntry.mainMeetingPlaceId
    });
  }

  selectBranchMeetingPlace() {
    this.navCtrl.push("SelectBranchPage", {
      callback: this.branchMeetingBackFunction,
      id: this.editingEntry.branchMeetingPlaceId
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
  testStaffBackFunction = params => {
    return new Promise((resolve, reject) => {
      if (typeof params != "undefined") {
        resolve("ok");
        if (!!params.data) {
          this.editingEntry.testPeopleId = params.data[0].userId;
          this.editingEntry.testPeople = params.data[0].userName;
          // this.editingEntry.applyDeptid = params.data[0].orgId;
          // this.editingEntry.applyDeptname = params.data[0].deptName;
          this.editingEntry.testTel = params.data[0].mobile;
        }
      } else {
        reject(Error("error"));
      }
    });
  };
  mainMeetingBackFunction = params => {
    return new Promise((resolve, reject) => {
      if (typeof params != "undefined") {
        resolve("ok");
        if (!!params.data) {
          this.editingEntry.mainMeetingPlaceId = params.data[0].id;
          this.editingEntry.mainMeetingPlace = params.data[0].name;
        }
      } else {
        reject(Error("error"));
      }
    });
  };

  branchMeetingBackFunction = params => {
    return new Promise((resolve, reject) => {
      var branchId = "";
      var branchName = "";
      if (typeof params != "undefined") {
        resolve("ok");

        if (!!params.data) {
          for (var i = 0; i <= params.data.length - 1; i++) {
            branchId += params.data[i].id + ",";
            branchName += params.data[i].name + ",";
          }
          branchId = branchId.substring(0, branchId.length - 1);
          branchName = branchName.substring(0, branchName.length - 1);
          this.editingEntry.branchMeetingPlaceId = branchId;
          this.editingEntry.branchMeetingPlace = branchName;
        }
      } else {
        reject(Error("error"));
      }
    });
  };
  //判断是否显示
  checkShow(type) {
    if (!!this.editingEntry.webServiceName) {
      return _.includes(this.editingEntry.webServiceName, type);
    } else {
      return false;
    }
  }

  goback() {
    this.navCtrl.pop();
  }

  //获取附件信息
  queryListFile(file, t) {
    this.http
      .get(ENV.httpurl + queryListFileUri + "/" + file)
      .subscribe(data => {
        if (t == "wift") {
          this.wffileList = data;
        }
        if (t == "kd") {
          this.kdfileList = data;
        }
        if (t == "video") {
          this.videofileList = data;
        }
      });
  }

  // 上传文件
  uploadFile(ev, type) {
    this.NativeService.showLoading();
    let formData = new FormData();
    formData.append("files", ev.target.files[0]);
    formData.append("filePath", "file");

    this.http.post(ENV.httpurl + uploadFileUri, formData).subscribe(
      data => {
        this.NativeService.hideLoading();
        this.uploadImg.nativeElement.value = "";
        if (!data["objBean"]) {
          this.NativeService.showAlert("文件上传失败！");
        } else {
          if (type == "wift") {
            this.wffileList.push(data["objBean"]);
          }
          if (type == "kd") {
            this.kdfileList.push(data["objBean"]);
          }
          if (type == "video") {
            this.videofileList.push(data["objBean"]);
          }
        }
      },
      error => {
        this.NativeService.hideLoading();
      }
    );
  }

  // 附件图标问题
  fileIcon(fileName) {
    let postfix = getFileExtName(fileName);
    //图片附件
    if ("|jpg|png|jpeg|bmp|gif|".indexOf(postfix) > 0) {
      return "img";
      //word附件
    } else if ("|docx|doc|".indexOf(postfix) > 0) {
      return "doc";
      //excel附件
    } else if ("|xlsx|xls|".indexOf(postfix) > 0) {
      return "excel";
      //PDF附件
    } else if ("|pdf|".indexOf(postfix) > 0) {
      return "pdf";
      //压缩包附件
    } else if ("|rar|zip|tar|gz|war|7z|".indexOf(postfix) > 0) {
      return "zip";
      // ppt
    } else if ("|pptx|ppt|".indexOf(postfix) > 0) {
      return "ppt";
      // txt
    } else if ("|txt|".indexOf(postfix) > 0) {
      return "txt";
      // 其他附件
    } else {
      return "file";
    }

    function getFileExtName(name) {
      try {
        return name
          .split(".")
          .pop()
          .toLowerCase();
      } catch (error) {
        return "file";
      }
    }
  }

  /**
   * 删除附件
   */
  removeFile(entity, i, type) {
    this.alertCtrl
      .create({
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
              if ((type = "wift")) {
                _.remove(this.wffileList, file => {
                  return file["id"] == entity.id;
                });
              }
              if ((type = "kd")) {
                _.remove(this.kdfileList, file => {
                  return file["id"] == entity.id;
                });
              }

              if ((type = "kd")) {
                _.remove(this.videofileList, file => {
                  return file["id"] == entity.id;
                });
              }
            }
          }
        ]
      })
      .present();
  }

  removefhq() {
    this.max = this.editingEntry.firewallPortServices;
    var fhqId = this.max[this.max.length - 1].id;
    this.alertCtrl
      .create({
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
              _.remove(this.editingEntry.firewallPortServices, data => {
                return data["id"] == fhqId;
              });
            }
          }
        ]
      })
      .present();
  }
  removeFhq(id) {
    this.alertCtrl
      .create({
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
              _.remove(this.editingEntry.firewallPortServices, data => {
                return data["id"] == id;
              });
            }
          }
        ]
      })
      .present();
  }

  addWorkhoursMxFn() {
    let profileModal = this.modalCtrl.create(this.fhqEditMxPage);
    profileModal.onDidDismiss(data => {
      if (data) {
        this.totalDate = (
          parseFloat(this.totalDate) + parseFloat(data.projectDate)
        ).toFixed(1);
        data.id = uuid(); // 添加 "主键" 用于区分每条明细
        this.editingEntry.firewallPortServices.push(data); // 数组操作
      }
    });
    profileModal.present();
  }
}
