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
import { ENV } from "@env/environment";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { NativeService } from "../../../../icommon/provider/native";
import _ from "lodash";
import {
  createApplyNoUri,
  queryListFileUri,
  uploadFileUri,
  saveEntityUri3
} from "../../../../icommon/provider/Constants";
import { Observable } from "rxjs/Rx";

@IonicPage()
@Component({
  selector: "page-seal-draft",
  templateUrl: "seal-draft.html"
})
export class SealDraftPage {
  userinfor: any;
  editable: any;
  editingEntry: any = {};
  sealNameList: any = {
    Zxz: "中心章",
    Zhbz: "综合办章",
    // Cghtz: '采购合同章',
    Wxhtz: "外协合同章",
    Htzsk: "合同章（收款）",
    Frz: "法人章"
  };
  //表单
  myForm: FormGroup;
  //附件列表信息
  fileList: any = [];
  //流程信息
  typeName: any;
  wfAlias: any;
  wfHolderObj: any;
  isLegalSeal: boolean = false;
  isWfJump: boolean = true;
  //页面所需接口
  httpurl: any = ENV.httpurl;
  @ViewChild("uploadImg") uploadImg: any;
  toggle: any;
  constructor(
    public modalCtrl: ModalController,
    public NativeService: NativeService,
    private alerCtrl: AlertController,
    public fb: FormBuilder,
    public http: HttpClient,
    public globalData: globalData,
    public navCtrl: NavController,
    public navParams: NavParams,
    private events: Events
  ) {
    this.userinfor = JSON.parse(localStorage.getItem("objectList"));
    this.editable = this.navParams.get("opeType") === "view" ? false : true;
    this.toggle = this.navParams.get("toggle");
    this.myForm = this.fb.group({
      opinion: ["", [Validators.required]]
    });

    if (this.navParams.get("opeType") === "cre") {
      // 创建
      this.getapplyNo();
      Object.assign(this.editingEntry, {
        userId: this.userinfor.loginInfo.userId,
        userName: this.userinfor.loginInfo.userName,
        deptId: this.userinfor.deptTo.deptId, //创建人部门ID
        deptName: this.userinfor.deptTo.deptName, //创建人部门名
        orgId: this.userinfor.staff.corpOrgId, //机构ID
        orgName: this.userinfor.deptTo.deptName, // 机构名称
        corpOrgId: this.userinfor.staff.corpOrgId, // 法人机构ID
        corpOrgName: this.userinfor.deptTo.deptName, // 法人机构名称
        applicant: this.userinfor.loginInfo.userName,
        phone: this.userinfor.loginInfo.mobNum,
        procedureStatus: "draft",
        createTime: new Date(
          new Date().getTime() - new Date().getTimezoneOffset() * 60 * 1000
        ).toISOString(),
        isLegalSeal:
          this.isLegalSeal == true
            ? (this.editingEntry.isLegalSeal = "1")
            : (this.editingEntry.isLegalSeal = "0"),
        isWfJump:
          this.isWfJump == true
            ? (this.editingEntry.isWfJump = "yes")
            : (this.editingEntry.isWfJump = "no")
      });
    } else {
      this.editingEntry = this.navParams.get("entry");
      if (!!this.editingEntry["fileId"]) {
        this.queryListFile(this.editingEntry["fileId"]);
      }
      if (!!this.editingEntry.createTime) {
        this.editingEntry.createTime = new Date(
          this.editingEntry.createTime -
            new Date().getTimezoneOffset() * 60 * 1000
        ).toISOString();
      }
      this.editingEntry.isLegalSeal == "1"
        ? (this.isLegalSeal = true)
        : (this.isLegalSeal = false);
      this.editingEntry.isWfJump == "yes"
        ? (this.isWfJump = true)
        : (this.isWfJump = false);
    }

    this.typeName = !!this.editingEntry.sealName
      ? this.editingEntry.sealName
      : null;
    this.getWfHolder(this.typeName);
  }
  goback() {
    this.navCtrl.pop();
  }
  dismiss() {
    // this.viewCtrl.dismiss();
  }
  //获取附件信息
  queryListFile(file) {
    this.http
      .get(ENV.httpurl + queryListFileUri + "/" + file)
      .subscribe(data => {
        this.fileList = data;
      });
  }
  //获取编号
  getapplyNo() {
    return this.http
      .post(ENV.httpurl + createApplyNoUri, null)
      .subscribe(data => {
        this.editingEntry.applyNo = data;
        return data;
      });
  }
  getWfHolder(typeName) {
    this.wfHolderObj = "";
    this.getWfAlias(typeName).then(wfAlias => {
      return this.globalData
        .getHolderFromWfAliasRef(wfAlias, this.navParams.get("ref"), null)
        .subscribe(async data => {
          return new Promise((resolve, reject) => {
            if (data) {
              resolve(data);
            }
          }).then(data => {
            this.wfHolderObj = this.globalData.compOtherInfo(data);
            this.globalData.setProc(this.wfHolderObj.btns());
            return this.wfHolderObj;
          });
        });
    });
  }
  getWfAlias(typeName) {
    return new Promise((resolve, reject) => {
      if (!!typeName) {
        this.editingEntry.sealNameCn = this.sealNameList[
          this.editingEntry.sealName
        ];
        this.wfAlias = "SealApply" + typeName;
        resolve(this.wfAlias);
      } else {
        this.wfAlias = "SealApplyZxz";
        resolve(this.wfAlias);
      }
    });
  }

  // 上传文件
  uploadFile(ev) {
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
          this.fileList.push(data["objBean"]);
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
  removeFile(entity, i) {
    this.alerCtrl
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
              _.remove(this.fileList, file => {
                return file["id"] == entity.id;
              });
            }
          }
        ]
      })
      .present();
  }

  // 暂存（有流程）/保存（无流程）
  saveAndReturn = _.debounce(function() {
    this.NativeService.showLoading();
    this.editingEntry.fileId =
      !!this.fileList && this.fileList.length > 0
        ? _.map(this.fileList, "id").join(",")
        : null;
    this.sureSub().subscribe(
      data => {
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
        this.NativeService.hideLoading();
        this.navCtrl.pop();
      },
      error => {
        this.NativeService.hideLoading();
      }
    );
  }, 800);
  //保存业务表数据
  sureSub(): Observable<any> {
    return Observable.create(observer => {
      var self = this;
      self.editingEntry.sealNameCn =
        self.sealNameList[self.editingEntry.sealName];
      self.editingEntry.createTime = new Date(
        Math.round(Date.parse(self.editingEntry.createTime)) +
          new Date().getTimezoneOffset() * 60 * 1000
      ).toISOString();
      return self.http
        .post(ENV.httpurl + saveEntityUri3, self.editingEntry)
        .subscribe(
          resp => {
            self.editingEntry.id = resp["id"]; // 将id重置回去，为了wfData获取数据
            observer.next(resp["businessKey"]); // 在流程提交组件里获取
          },
          error => {
            observer.error(error);
            this.NativeService.hideLoading();
          }
        );
    });
  }
  // 选人之前处理，没有什么处理时，可以不写返回值
  beforeSelectRes() {
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
    this.navCtrl.pop(); // 流程提交后 返回的页面
  }
  // 获取保存到流程实例workflowInstData字段中的数据，建议保存关联键（主键id）
  getWfData() {
    return {
      bizId: this.editingEntry.id
    };
  }
  //流程操作
  manage = _.throttle(function(btn, opinion) {
    if (!this.editingEntry.applyReason) {
      this.NativeService.showAlert("请填写申请事由！");
      return;
    }
    if (!this.editingEntry.sealName) {
      this.NativeService.showAlert("请选择用章类型！");
      return;
    }
    if (!this.editingEntry.phone) {
      this.NativeService.showAlert("请填写联系电话！");
      return;
    }
    this.NativeService.showLoading();
    this.editingEntry.fileId =
      !!this.fileList && this.fileList.length > 0
        ? _.map(this.fileList, "id").join(",")
        : null;
    btn.proc(
      this.myForm.value.opinion,
      () => this.sureSub(),
      () => this.getWfData(),
      () => this.lastDo(),
      () => this.beforeSelectRes(),
      selected => this.afterSelectRes(selected),
      () => this.getNextPoint()
    );
  }, 800);

  //附件PDF预览
  showPd(id) {
    // let url = '/assets/generic/web/viewer.html?file=compressed.tracemonkey-pldi-09.pdf#page=1';
    let url = "/assets/generic/web/viewer.html?file=";
    let urlN = ENV.httpurl + "/api/fileinfo/downloadFile/" + id;
    let pdf = this.modalCtrl.create("PdfViewPage", {
      options: url + encodeURIComponent(urlN) + "#page=1"
    });
    pdf.present();
  }

  changeIsLegalSeal() {
    this.isLegalSeal == true
      ? (this.editingEntry.isLegalSeal = "1")
      : (this.editingEntry.isLegalSeal = "0");
  }
  changeisWfJump() {
    this.isWfJump == true
      ? (this.editingEntry.isWfJump = "yes")
      : (this.editingEntry.isWfJump = "no");
  }
}
