import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ModalController } from 'ionic-angular';
import { globalData } from '../../../../icommon/provider/globalData';
import { HttpClient } from '@angular/common/http';
import { ENV } from '@env/environment';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NativeService } from '../../../../icommon/provider/native';
import { Observable } from 'rxjs/Rx';
import { queryListFileUri, uploadFileUri, saveEntityUri7, wfAlias7 } from '../../../../icommon/provider/Constants';
import _ from 'lodash';




@IonicPage()
@Component({
  selector: 'page-matters-draft',
  templateUrl: 'matters-draft.html',
})
export class MattersDraftPage {
  userinfor: any;
  editable: any;
  editingEntry: any = {};
  //表单
  myForm: FormGroup;
  //附件列表信息
  fileList: any = [];
  //流程信息
  typeName: any;
  wfAlias: any;
  wfHolderObj: any;
  //
  @ViewChild('uploadImg') uploadImg: any;
  constructor(public modalCtrl: ModalController, public NativeService: NativeService, private alerCtrl: AlertController, public fb: FormBuilder, public http: HttpClient, public globalData: globalData, public navCtrl: NavController, public navParams: NavParams) {
    this.userinfor = JSON.parse(localStorage.getItem("objectList"));
    this.editable = this.navParams.get("opeType") === 'view' ? false : true;

    this.myForm = this.fb.group({
      opinion: ['', [Validators.required]]
    });

    if (this.navParams.get("opeType") === 'cre') {
      Object.assign(this.editingEntry, {
        userId: this.userinfor.loginInfo.userId,
        userName: this.userinfor.loginInfo.userName,
        deptId: this.userinfor.deptTo.deptId, //创建人部门ID
        deptName: this.userinfor.deptTo.deptName, //创建人部门名
        orgId: this.userinfor.staff.corpOrgId, //机构ID
        orgName: this.userinfor.deptTo.deptName, // 机构名称
        corpOrgId: this.userinfor.staff.corpOrgId, // 法人机构ID
        corpOrgName: this.userinfor.deptTo.deptName, // 法人机构名称
        applyDate: new Date(),
        procedureStatus: 'draft',
        createTime: new Date()
      });
    } else {
      if (!!this.editingEntry.fuId) {
        this.queryListFile(this.editingEntry.fuId);
      }
    }
  }
  //获取附件信息
  queryListFile(file) {
    this.http.get(ENV.httpurl + queryListFileUri + '/' + file).subscribe(data => {
      this.fileList = data;
    });
  }
  ionViewDidEnter() {
    this.wfHolder();
  }
  // 获取工作流配置、实例信息
  wfHolder() {
    this.globalData.getHolderFromWfAliasRef(wfAlias7, this.navParams.get("ref"), null).subscribe(async data => {
      this.wfHolderObj = this.globalData.compOtherInfo(data);
      this.globalData.setProc(this.wfHolderObj.btns())
    })
  }
  // 流程处理
  manage(btn) {
    let self = this;
    if (!this.editingEntry.fileName) {
      this.NativeService.showAlert('请选择文件名称！');
      return;
    }
    if (!this.editingEntry.fileNum) {
      this.NativeService.showAlert('请填写文件编号！');
      return;
    }
    btn.proc(this.myForm.value.opinion, () => self.sureSub(), () => self.getWfData(), () => self.lastDo(), () => self.beforeSelectRes(), (selected) => self.afterSelectRes(selected), () => self.getNextPoint(), () => self.procBackPoint());
  }
  // 选人之前处理，没有什么处理时，可以不写返回值
  beforeSelectRes() {
    return {}
  }
  procBackPoint() {
    return {}
  }
  // 选人之后处理
  afterSelectRes(selected) {
    console.debug('选择的人....', selected);
  }
  // 获取下一环节，默认提交给下一环节，可以不写返回值
  getNextPoint() {

  }
  // 提交流程后的操作
  lastDo() {
    this.NativeService.showToast("操作成功").then(()=>{
      setTimeout(() => {
        this.navCtrl.pop()
      },800)
    })
      // 流程提交后 返回的页面
  }
  // 保存业务表数据
  sureSub(): Observable<any> {
    return Observable.create(observer => {
      let self = this;
      this.editingEntry.fuId = !!this.fileList && this.fileList.length > 0 ? _.map(this.fileList, 'id').join(',') : null;
      return self.http.post(ENV.httpurl + saveEntityUri7, self.editingEntry).subscribe(resp => {
        self.editingEntry.id = resp['id']; // 将id重置回去，为了wfData获取数据
        observer.next(resp['businessKey']);// 在流程提交组件里获取
      }, error => {
        observer.error(false);
      });
    });
  }
  // 暂存（有流程）/保存（无流程）
  saveAndReturn() {
    this.sureSub().subscribe(data => {
      this.NativeService.showToast("操作成功").then(()=>{
        setTimeout(() => {
          this.navCtrl.pop()
        },800)
      })
    }, error => {
    })
  }
  // 获取保存到流程实例workflowInstData字段中的数据，建议保存关联键（主键id）
  getWfData() {
    return { bizId: this.editingEntry.id };
  }
  // 上传文件
  uploadFile(ev) {
    console.log(ev)
    let formData = new FormData();
    formData.append('files', ev.target.files[0]);
    formData.append('filePath', 'file');

    this.http.post(ENV.httpurl + uploadFileUri, formData).subscribe(data => {
      this.uploadImg.nativeElement.value = ''
      console.log(data);
      if (!data['objBean']) {
        this.NativeService.showAlert('文件上传失败！');
      } else {
        this.fileList.push(data['objBean']);
      }
    }, error => {
      console.log(error)
    })
  }
  // 附件图标问题
  fileIcon(fileName) {
    let postfix = getFileExtName(fileName);
    //图片附件
    if ("|jpg|png|jpeg|bmp|gif|".indexOf(postfix) > 0) {
      return 'img';
      //word附件
    } else if ("|docx|doc|".indexOf(postfix) > 0) {
      return 'doc';
      //excel附件
    } else if ("|xlsx|xls|".indexOf(postfix) > 0) {
      return 'excel';
      //PDF附件
    } else if ("|pdf|".indexOf(postfix) > 0) {
      return 'pdf';
      //压缩包附件
    } else if ("|rar|zip|tar|gz|war|7z|".indexOf(postfix) > 0) {
      return 'zip';
      // ppt
    } else if ("|pptx|ppt|".indexOf(postfix) > 0) {
      return 'ppt';
      // txt
    } else if ("|txt|".indexOf(postfix) > 0) {
      return 'txt';
      // 其他附件
    } else {
      return 'file';
    }

    function getFileExtName(name) {
      try {
        return name.split('.').pop().toLowerCase();
      } catch (error) {
        return 'file';
      }
    }
  }

  /**
  * 删除附件
  */
  removeFile(entity, i) {
    this.alerCtrl.create({
      title: "确定删除吗？",
      message: "",
      buttons: [
        {
          text: '取消',
          handler: () => {
          }
        },
        {
          text: '确定',
          handler: () => {
            _.remove(this.fileList, (file) => {
              return file['id'] == entity.id;
            });
          }
        }
      ]
    }).present();

  }
  goback(){
    this.navCtrl.pop();
  }
}


