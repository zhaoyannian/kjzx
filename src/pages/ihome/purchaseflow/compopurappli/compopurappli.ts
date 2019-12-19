import { NativeService } from '../../../../icommon/provider/native';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ModalController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import _ from 'lodash';
import { ENV } from '@env/environment';
import { globalData } from '../../../../icommon/provider/globalData';
import {
  handleUri3, handleNewUri3, readFlowOpinionUri, getAmountConfigUri3, fileSearchUri, opionsUri, readSubUri, querySubColumn, detailReadUri, temporaryUri
  , readPointInfoUri, readButtonUri, purchaseWayStatuss, roleStaffUri,roleIdOne,roleIdTwo, getDirectDeptStaffsUri, createUri3
} from '../../../../icommon/provider/Constantscg';
import 'rxjs/add/operator/timeout';
import { Events } from 'ionic-angular';
import { Keyboard } from '@ionic-native/keyboard';
/**
* Generated class for the CompopurappliPage page.
*
* See https://ionicframework.com/docs/components/#navigation for more info on
* Ionic pages and navigation.
*/

@IonicPage()
@Component({
  selector: 'page-compopurappli',
  templateUrl: 'compopurappli.html',
})
export class CompopurappliPage {
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
  draftsUserName2:any;
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
  datamore:any ={};
  toggle:any;
  constructor(private events: Events,private keyboard: Keyboard,public modalCtrl: ModalController, public globalData: globalData, public NativeService: NativeService, public http: HttpClient, private alerCtrl: AlertController, public navCtrl: NavController, public navParams: NavParams) {
    this.userinfor = JSON.parse(localStorage.getItem("objectList"));
    this.editable = this.navParams.get("bl");
    this.entry = this.navParams.get("entry");
    this.toggle = this.navParams.get("toggle");
    this.flowType = this.navParams.get("flowType");
  }
  goback() {
    this.navCtrl.pop();
  }
  ionViewDidEnter() {
    this.init()
    this.httpurl = ENV.httpurlscm;
    this.getOpinionList();
    this.keyboard.onKeyboardWillShow().subscribe(data =>{
      if(this.NativeService.isAndroid()){
        this.datamore.btnscroll = true;
        this.datamore.btnscollHeight = data.keyboardHeight;
        this.events.publish('btnscroll', this.datamore);
      }
    })
    this.keyboard.onKeyboardWillHide().subscribe(data =>{
      if(this.NativeService.isAndroid()){
        this.datamore.btnscroll = false;
        this.events.publish('btnscroll', this.datamore);
      }
    })

  }
  async init() {
    this.NativeService.showLoading();
    let dataId = this.navParams.get("entry").dataId;
    this.http.post(ENV.httpurlscm + handleNewUri3 + '/' + dataId, {}).subscribe(async data => {
      await this.requestOrg(handleUri3, dataId, data, this.navParams.get("bl"))
    })

  } // 原始的公共的发送请求的方法
  requestOrg(uri, params, entity, bl) {
    let self = this;
    this.http.post(ENV.httpurlscm + uri + '/' + params, {}).timeout(9000).subscribe(async data => {
     
      self.editingEntry = entity;
      self.point = data;
      self.transformEntry(self.editingEntry.bizEntity);
      //初始化获取限制金额段
      self.currAmount(self.editingEntry);

      //加载附件信息
      self.getFileList();

      //加载单一来源附件信息
      self.getSingleFileList();

      // 获取不可编辑字段
      self.getDisFis();

      // 获取下拉框的值
      self.getOpions();

      //获取预算信息
      self.getDataInformations();

      //获取采购明细
      self.getDetailInformations();
      if (!!this.navParams.get("bl")) {
        await self.complex(self.editingEntry);
      }
      this.NativeService.hideLoading();
    })
  }
  // 复杂提交
  complex(entry) {
    var self = this;
    if (entry.bizEntity.subjectFunding !== entry.bizEntity.amount) {
      this.NativeService.showAlert("课题资金和预测总额不一致！");
      return;
    }
    // var _bizParams = entry.bizMap && entry.bizMap.bizStatus == 'create' ? {
    //   params: {
    //     status: '0'
    //   }
    // } : {};
    self.request(ENV.httpurlscm + temporaryUri, self.bizToFolwTitle(entry))
      .then(async data => {
        this.hjenty = data;
        await this.getDefaultOpinion();
        await this.getPointInfo();
      }, error => console.log(error));

  }
  //获取环节信息
  getPointInfo() {
    this.http.post(ENV.httpurlscm + readPointInfoUri + '/' + this.hjenty.flowSaveParDto.flowInstId, {}).subscribe(async resp => {
      this.points = resp;
      this.len = resp['length'];
      // 获取当前环节 STATE=2
      this.currentPoint = _.find(this.points, function (n) {
        return n.STATE === '2';
      });
      await this.getButton(this.hjenty.flowSaveParDto.pointId)
      // this.n = this.currentPoint ? this.getN(defaultDisplayPoint, this.len, this.currentPoint.SEQ) : 0;
    }, error => console.log(error))

    //        模拟数据
    /**
     * 已经走过的环节--1，当前环节--2，未走过的环节--3
     * @type {Array}
     */

  }
  //获取该环节的按钮
  getButton(pointId) {
    var self = this;
    pointId = pointId || self.hjenty.flowSaveParDto.pointId;
    return new Promise((resolve, reject) => {
      self.http.post(ENV.httpurlscm + readButtonUri + '/' + pointId, {})
        .subscribe(resp => {
          self.buttons = resp;
          resolve(self.buttons);
          console.log(resp)
        }, error => {

        })
    })
  }
  //获取默认的办理意见
  getDefaultOpinion() {
    var self = this;
    self.OPINION_TITLE = '同意';
    if (self.hjenty.flowSaveParDto.flowInstName === '采购经办人' && !self.hjenty.bizEntity.caCode) {
      self.OPINION_TITLE = '同意，建议进行【' + purchaseWayStatuss[self.hjenty.bizEntity.purchaseWay] + '】';
    }
  }
  // 公共的发送请求的方法
  request(uri, params) {
    return new Promise((resolve, reject) => {
      return this.http.post(uri, params).subscribe(resp => {
        resolve(resp);
      }, error => {
        reject();
      }) // 出错，返回空对象);
    })
  }
  // 组装数据到flowData的title里
  bizToFolwTitle(entries) {
    let title = entries.bizEntity;
    entries.flowSaveParDto.dataTitle = JSON.stringify(title);
    // delete entries.bizEntity.userName;
    // delete entries.bizEntity.deptName;
    return entries;
  }
  //获取采购明细
  getDetailInformations() {
    let parmars = {}
    parmars = {
      params: {
        page: 1,
        pageSize: 1000
      }
    }
    this.http.post(ENV.httpurlscm + detailReadUri + "/" + this.editingEntry.bizEntity.id, this.getParams(), parmars).subscribe(data => {
      console.log(data);
      this.detailInformations = data;
    })
  }
  //获取预算信息
  getDataInformations() {
    let parmars = {}
    parmars = {
      params: {
        page: 1,
        pageSize: 1000
      }
    }
    this.http.post(ENV.httpurlscm + readSubUri + "/" + this.editingEntry.bizEntity.id, this.getParams(), parmars).subscribe(data => {
      console.log(data);
      this.dataInformations = data;
      this.interceptorSub(data);
    })
  }
  interceptorSub(data) {
    this.totalAll = _.sumBy(data, 'amount');
    this.maxTotalAll = this.totalAll;
    this.editingEntry.bizEntity.subjectFunding = this.totalAll;
    return data;
  }
  getParams() {
    return {
      queryColumn: querySubColumn
    };
  }
  changepurchaseType() {
    _.map(this.purchaseTypeList, (d) => {
      if (d.optionValue === this.editingEntry.bizEntity.purchaseType) {
        this.editingEntry.bizEntity.purchaseTypeName = d.optionName;
      }
    });
  }
  changepurdraftingDept() {
    _.map(this.draftingDeptList, (d) => {
      if (d.optionValue === this.editingEntry.bizEntity.draftingDept) {
        this.editingEntry.bizEntity.draftingDeptName = d.optionName;
        this.editingEntry.bizEntity.draftingDept = d.optionValue;
        this.draftsUserName2 = d.optionValue === "bmzx" ? this.draftsUserName : "";
        // if(d.optionValue === "bmzx"){
        //   this.editingEntry.bizEntity.contractDraftingStaff = this.editingEntry.bizEntity.applicant;
        //   this.draftsUserName = this.editingEntry.bizEntity.userName;
        // }else{
        //   this.editingEntry.bizEntity.contractDraftingStaff = "";
        //   this.draftsUserName = "";
        // }
      }
    });
  }
  changetenderRecord() {
    _.map(this.tenderRecordList, (d) => {
      if (d.optionValue === this.editingEntry.bizEntity.tenderRecord) {
        this.editingEntry.bizEntity.tenderRecordName = d.optionName;
      }
    });
  }
  changepurchaseWay() {
    _.map(this.purchaseWayList, (d) => {
      if (d.optionValue === this.editingEntry.bizEntity.purchaseWay) {
        this.editingEntry.bizEntity.purchaseWayName = d.optionName;
      }
    });
  }
  getOpions() {
    var self = this;
    //是否招标备案
    self.http.post(ENV.httpurlscm + opionsUri, { dictCode: 'SYSTEM_BOOLEAN_STATE' }).subscribe(resp => {
      self.tenderRecordList = resp;
      _.map(self.tenderRecordList, (d) => {
        if (d.optionValue === self.editingEntry.bizEntity.tenderRecord) {
          self.editingEntry.bizEntity.tenderRecordName = d.optionName;
        }
      });
    });
    //采购类型
    self.http.post(ENV.httpurlscm + opionsUri, { dictCode: 'SCM_APPLYORCONTRACT_TYPE' }).subscribe(resp => {
      self.purchaseTypeList = resp;
      _.map(self.purchaseTypeList, (d) => {
        if (d.optionValue === self.editingEntry.bizEntity.purchaseType) {
          self.editingEntry.bizEntity.purchaseTypeName = d.optionName;
        }
      });
    });
    //采购种类
    self.http.post(ENV.httpurlscm + opionsUri, { dictCode: 'SCM_MATERIAL_TYPE' }).subscribe(resp => {
      _.map(resp, (d) => {
        if (d['optionValue'] === self.editingEntry.bizEntity.materialType) {
          self.editingEntry.bizEntity.materialTypeName = d['optionName'];
        }
      });
    });
    //采购来源
    self.http.post(ENV.httpurlscm + opionsUri, { dictCode: 'SBM_PURCHASE_SOURCE' }).subscribe(resp => {
      self.purchaseSourceList = resp;
      _.map(self.purchaseSourceList, (d) => {
        if (d.optionValue === self.editingEntry.bizEntity.purchaseSource) {
          self.editingEntry.bizEntity.purchaseSourceName = d.optionName;
        }
      });
    });


    //合同起草部门
    self.http.post(ENV.httpurlscm + opionsUri, {
      dictCode: 'SCM_APPLY_BM'
    }).subscribe(resp => {
      self.draftingDeptList = resp;
      _.map(self.draftingDeptList, (d) => {
        if (d.optionValue === self.editingEntry.bizEntity.draftingDept) {
          self.editingEntry.bizEntity.draftingDeptName = d.optionName;
          this.editingEntry.bizEntity.draftingDept = d.optionValue;
        }
      });
    });
    //建议采购方式
    self.http.post(ENV.httpurlscm + opionsUri, {
      dictCode: 'SCM_YQJ_PURCHASER_WAY'
    }).subscribe(resp => {
      self.purchaseWayList = resp;
      _.map(self.purchaseWayList, (d) => {
        if (d.optionValue === self.editingEntry.bizEntity.purchaseWay) {
          self.editingEntry.bizEntity.purchaseWayName = d.optionName;
        }
      });
    });
  }
  // 获取不可编辑字段
  getDisFis() {
    var self = this;
    if (self.point.hasOwnProperty('lockFileds')) {
      self.lockfileds = self.point.lockFileds;
    }
    if (!self.lockfileds) {
      self.lockfileds = "";
    }
  }
  // 单一来源
  getSingleFileList() {
    this.http.get(ENV.httpurlscm + fileSearchUri + this.editingEntry.bizEntity.id + '/singleSource').subscribe(data => {
      this.singleSourceFileList = data;
    });
  }
  //获取附件信息
  getFileList() {
    this.http.get(ENV.httpurlscm + fileSearchUri + this.editingEntry.bizEntity.id + '/file').subscribe(data => {
      this.fileList = data;
    })
  }
  //获取金额配置段
  currAmount(entry) {
    var self = this;
    if (!!entry && !!entry.flowSaveParDto.flowInstId) {
      //有流程实例ID，限制金额段
      var amount = entry.bizEntity.amount;
      self.http.post(ENV.httpurlscm + getAmountConfigUri3, {}).subscribe(resp => {
        var amounts = resp;
        amount = Math.floor(amount * 100) / 100;
        if (Number(amount) <= amounts['firstAmount']) {
          self.currAmounts = {
            minAmount: 0,
            maxAmount: amounts['firstAmount']
          };
        } else if (Number(amount) > amounts['firstAmount'] && Number(amount) <= amounts['secondAmount']) {
          self.currAmounts = {
            minAmount: amounts['firstAmount'],
            maxAmount: amounts['secondAmount']
          };
        } else if (Number(amount) > amounts['secondAmount'] && Number(amount) <= amounts['thirdAmount']) {
          self.currAmounts = {
            minAmount: amounts['secondAmount'],
            maxAmount: amounts['thirdAmount']
          };
        } else if (Number(amount) > amounts['thirdAmount'] && Number(amount) <= amounts['fourthAmount']) {
          self.currAmounts = {
            minAmount: amounts['thirdAmount'],
            maxAmount: amounts['fourthAmount']
          };
        } else if (Number(amount) > amounts['fourthAmount']) {
          self.currAmounts = {
            minAmount: amounts['fourthAmount'],
            maxAmount: ''
          };
        }
      });
    } else {
      self.currAmounts = {};
    }
  }
  // 实体翻译
  transformEntry(entry) {
    var self = this;
    let inputField = 'applicant';
    let valueFields = ['userName'];
    let destFields = ['userName'];
    self.globalData.transformStaffEntity(inputField, valueFields, destFields, [entry], 'cgIp');
    if (!entry.tenderRecord) {
      entry.tenderRecord = 'FALSE';
    }
    if (entry.competentDeptUserID) {
      let userIds = entry.competentDeptUserID.split(',');
      let userIdEntry = _.map(userIds, (id) => { return { userId: id }; });
      let inputField = 'userId';
      let valueFields = ['userName'];
      let destFields = ['userName'];
      self.globalData.transformStaffEntity(inputField, valueFields, destFields, userIdEntry, 'cgIp').then((data) => {
        self.cdUserName = _.map(data, (e) => e['userName']).join(',');
      });
    }
    if (entry.chargeBusinessUserID) {
      let userIds = entry.chargeBusinessUserID.split(',');
      let userIdEntry = _.map(userIds, (id) => { return { userId: id }; });
      let inputField = 'userId';
      let valueFields = ['userName'];
      let destFields = ['userName'];
      self.globalData.transformStaffEntity(inputField, valueFields, destFields, userIdEntry, 'cgIp').then((data) => {
        self.cbUserName = _.map(data, (e) => e['userName']).join(',');
      });
    }

    if (entry.contractDraftingStaff) {
      let userIds = entry.contractDraftingStaff.split(',');
      let userIdEntry = _.map(userIds, (id) => { return { userId: id }; });
      let inputField = 'userId';
      let valueFields = ['userName'];
      let destFields = ['userName'];
      self.globalData.transformStaffEntity(inputField, valueFields, destFields, userIdEntry, 'cgIp').then((data) => {
        self.draftsUserName = _.map(data, (e) => e['userName']).join(',');
        self.draftsUserName2 =   self.draftsUserName;
      });
    }

    let clzName1 = 'com.stonewomb.common.entity.Organization';
    let inputField1 = 'orgId';
    let indexedField1 = 'orgId';
    let valueFields1 = ['deptId'];
    let destFields1 = ['deptId'];

    self.globalData.transformEntity(clzName1, inputField1, indexedField1, valueFields1, destFields1, [self.editingEntry.bizEntity], 'cgIp').then(
      (data) => {
        self.editingEntry.bizEntity = data['length'] > 0 ? data[0] : self.editingEntry.bizEntity;
        let inputField2 = 'deptId';
        let valueFields2 = ['deptName'];
        let destFields2 = ['orgName'];
        self.globalData.transformDeptEntity(inputField2, valueFields2, destFields2, [self.editingEntry.bizEntity], 'cgIp');
      }
    );
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
  //获取意见表
  getOpinionList() {
    let entity = this.navParams.get("entry")
    this.http.post(ENV.httpurlscm + readFlowOpinionUri + '/' + entity.flowInstId, {}).subscribe(resp => {
      this.opinionList = resp;
    }, () => { });
  }
  viewFlow() {
    this.navCtrl.push("FlowprocessPage", { entry: this.navParams.get("entry") })
  }












  //选人
  selectStaffType(type) {
    var self = this;
    var uri = '';
    if (type === "cdUserName") {
      uri = roleStaffUri + roleIdOne;
    } else if (type === "draftsUserName") {
      uri = getDirectDeptStaffsUri + self.userinfor.staff.userId;
    } else if (type === "chargeBusinessUserName") {
      uri = roleStaffUri + roleIdTwo;
    }
    let profileModal = this.modalCtrl.create('PagingSelectPage', { 'requesttype': 'get', 'type': null, 'url': uri, 'bizdata': null, });
    profileModal.onDidDismiss(selectedItem => {
      if (selectedItem) {
        if (type === "cdUserName") {
          self.cdUserName = selectedItem.userName;
          self.editingEntry.bizEntity.competentDeptUserID = selectedItem.userId;
        } else if (type === "draftsUserName") {
          self.draftsUserName = selectedItem.userName;
          self.draftsUserName2 =   self.draftsUserName;
          self.editingEntry.bizEntity.contractDraftingStaff = selectedItem.userId;
        } else if (type === "chargeBusinessUserName") {
          self.cbUserName = selectedItem.userName;
          self.editingEntry.bizEntity.chargeBusinessUserID = selectedItem.userId;
        }
      }

      //做一次保存操作，用于保存选择的人员
      self.saveBizData(self.editingEntry.bizEntity);

    });
    profileModal.present();
  }

  saveBizData(entity){
    return new Promise((resolve, reject) => {
      return this.http.post(ENV.httpurlscm + createUri3,entity).subscribe(resp => {
        resolve(resp);
        }, error => {

        })
    })
  }


}
