import { ENV } from '@env/environment';
import { globalData } from '../../../../icommon/provider/globalData';
import { NativeService } from '../../../../icommon/provider/native';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ModalController } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import _ from 'lodash';
import {
  handleNewUri2, handleUri2, readSubUri, payReadUri, deliveryReadUri, querySubColumn, roleStaffUri, roleIdOne, fileSearchUri, getAmountConfigUri, opionsUri, readFlowOpinionUri, temporaryUri2
  , readButtonUri, purchaseWayStatuss, readPointInfoUri, createUri2
} from '../../../../icommon/provider/Constantscg';
import 'rxjs/add/operator/timeout';
import { Events } from 'ionic-angular';
import { Keyboard } from '@ionic-native/keyboard';

@IonicPage()
@Component({
  selector: 'page-instrument',
  templateUrl: 'instrument.html',
})
export class InstrumentPage {
  userinfor: any = {};
  opinionList: any;
  httpurl: any;
  editingEntry: any = {};
  point: any = {};
  inittitle: any;
  caCode: any;
  isButton: any;
  deliveryReadUri: any;
  payReadUri: any;
  readSubUri: any;
  fileList: any = [];
  editable: boolean = false;
  dataInformations: any = [];
  totalAll: any;
  maxTotalAll: any;
  collspaed: boolean = true;
  lockfileds: any;
  currAmounts: any = {};
  tenderRecordList: any = [];
  purchaseTypeList: any = [];
  purchaseWayList: any = [];
  draftingDeptList: any = [];
  projectList: any = [];
  developSubassetsList: any = [];
  purchaseSourceList: any = [];
  assetPurposeList: any = [];
  cdUserName: any;
  cbUserName: any;
  draftsUserName: any;
  chargeBusinessUserName: any;
  _bizParams: any;
  hjenty: any = {};
  buttons: any = [];
  OPINION_TITLE: any;
  myForm: FormGroup;
  points: any = [];
  len: any;
  currentPoint: any;
  lastPoint: any;
  firstPoint: any;
  nextPoint: any;
  nexthandleUser: any;
  ignoredPoint: any;
  specialDept: any;
  selectPatrIn: any;
  partInUserId: any;
  dataUrl: any;
  testRe: any;
  payInformations: any = [];
  deliveryPlanInfos: any = [];
  entry: any = {};
  flowType: any;
  datamore: any = {};
  conInfo:any=true;
  toggle:any;
  constructor(private events: Events, private keyboard: Keyboard, public modalCtrl: ModalController, public fb: FormBuilder, public globalData: globalData, public NativeService: NativeService, public http: HttpClient, private alerCtrl: AlertController, public navCtrl: NavController, public navParams: NavParams) {
    this.userinfor = JSON.parse(localStorage.getItem("objectList"));
    this.editable = this.navParams.get("bl");
    this.entry = this.navParams.get("entry");
    this.toggle = this.navParams.get("toggle");
    this.myForm = this.fb.group({
      opinion: ['', [Validators.required]],
    });
    this.flowType = this.navParams.get("flowType");
  }
  goback() {
    this.navCtrl.pop();
  }
  ionViewDidEnter() {
    console.log('ionViewDidLoad PurchasefloweditorPage');
    this.init()
    this.httpurl = ENV.httpurlscm;
    this.getOpinionList();
    this.keyboard.onKeyboardWillShow().subscribe(data => {
      if (this.NativeService.isAndroid()) {
        this.datamore.btnscroll = true;
        this.datamore.btnscollHeight = data.keyboardHeight;
        this.events.publish('btnscroll', this.datamore);
      }
    })
    this.keyboard.onKeyboardWillHide().subscribe(data => {
      if (this.NativeService.isAndroid()) {
        this.datamore.btnscroll = false;
        this.events.publish('btnscroll', this.datamore);
      }
    })
  }
  async init() {
    this.NativeService.showLoading();
    let dataId = this.navParams.get("entry").dataId;
    this.http.post(ENV.httpurlscm + handleNewUri2 + '/' + dataId, {}).subscribe(async data => {
      await this.requestOrg(handleUri2, dataId, data, this.navParams.get("bl"))
    })

  } // 原始的公共的发送请求的方法
  requestOrg(uri, params, entity, bl) {
    let that = this;
    this.http.post(ENV.httpurlscm + uri + '/' + params, {}).timeout(9000).subscribe(async data => {

      that.editingEntry = entity;
      that.point = data;

      await this.transformEntry(this.editingEntry);
      //初始化获取限制金额段
      await this.currAmount(this.editingEntry);

      //加载附件信息
      await this.getFileList();

      // 获取不可编辑字段
      await this.getDisFis();

      // 获取下拉框的值
      await this.getOpions();

      //获取预算信息
      await this.getDataInformations();
      //获取付款信息
      await this.getpayInformations();

      await this.getDeliveryPlanInfos();
      if (!!this.navParams.get("bl")) {
        await that.complex(that.editingEntry);
      }
      this.NativeService.hideLoading();
    })
  }
  complex(entry) {
    var self = this;
    this._bizParams = entry.bizMap && entry.bizMap.bizStatus == 'create' ? {
      params: {
        status: '0'
      }
    } : {};
    self.request(ENV.httpurlscm + temporaryUri2, self.bizToFolwTitle(entry))
      .then(async data => {
        this.hjenty = data;
        await this.getDefaultOpinion();
        await this.getPointInfo();
        // await this.saveBizData(this.editingEntry.bizEntity);
      }, error => console.log(error));
  }
  //保存业务数据
  // saveBizData(entity) {
  //   return new Promise((resolve, reject) => {
  //     return this.http.post(ENV.httpurlscm + createUri2, entity).subscribe(resp => {
  //       resolve(resp);
  //     }, error => {

  //     })
  //   })

  // }
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
  getpayInformations() {
    let params = {};
    params = {
      params: {
        'page': 1,
        'pageSize': 1000
      },

    }

    this.http.post(ENV.httpurlscm + this.payReadUri, this.getParams(), params).subscribe(data => {
      this.payInformations = data;
    })

  }
  getDeliveryPlanInfos() {
    let params = {};
    params = {
      params: {
        'page': 1,
        'pageSize': 1000
      },

    }

    this.http.post(ENV.httpurlscm + this.deliveryReadUri, this.getParams(), params).subscribe(data => {
      this.deliveryPlanInfos = data;
    })
  }
  transformEntry(entry) {
    var self = this;
    var title = '仪器设备合同申请';
    self.inittitle = entry.bizEntity.contractType === 'within' ? '内贸' + title : '外贸' + title;
    self.caCode = entry.bizEntity ? entry.bizEntity.caCode : "";
    if ((!entry || !entry.flowSaveParDto.flowInstId) && entry.bizEntity.status != 'draft') {
      self.editingEntry.bizEntity.contractPrice = '';
    }
    /*
    修改逻辑：
    1.所有环节点击查看（isButton为false）时，页面不能修改。
    2.编辑时（self.isButton为true）,合同管理环节（_.includes(self.editingEntry.flowSaveParDto.flowInstName || '', '合同管理'))）可以修改
    */
    if (self.isButton) {
      self.isButton = (_.includes(self.editingEntry.flowSaveParDto.flowInstName || '', '合同管理')) ? true : self.isButton;
    }
    //isButton为true 表示可编辑
    self.editable = (_.includes(self.editingEntry.flowSaveParDto.flowInstName || '', '合同管理')) && self.isButton ? false : self.editable;
    let clzName1 = 'com.stonewomb.common.entry.Organization';
    let inputField1 = 'orgCode';
    let indexedField1 = 'orgId';
    let valueFields1 = ['deptId'];
    let destFields1 = ['deptId'];
    self.globalData.transformEntity(clzName1, inputField1, indexedField1, valueFields1, destFields1, [self.editingEntry.bizEntity], 'cgIp').then(
      (data) => {
        self.editingEntry.bizEntity = data['length'] > 0 ? data[0] : self.editingEntry.bizEntity;
        let inputField2 = 'orgCode';
        let valueFields2 = ['deptName'];
        let destFields2 = ['orgCodeName'];
        self.globalData.transformDeptEntity(inputField2, valueFields2, destFields2, [self.editingEntry.bizEntity], 'cgIp');
      }
    );
    let inputField = 'applicant';
    let valueFields = ['userName'];
    let destFields = ['applicantName'];
    self.globalData.transformStaffEntity(inputField, valueFields, destFields, [self.editingEntry.bizEntity], 'cgIp');
    self.readSubUri = readSubUri + "/" + entry.bizEntity.id; //caCode;
    self.payReadUri = payReadUri + "/" + entry.bizEntity.id; //caCode;
    self.deliveryReadUri = deliveryReadUri + "/" + entry.bizEntity.id;
    if (self.editingEntry.bizEntity.competentDeptUserID) {
      let userIds = self.editingEntry.bizEntity.competentDeptUserID.split(',');
      let userIdEntry = _.map(userIds, (id) => { return { userId: id }; });
      let inputField = 'userId';
      let valueFields = ['userName'];
      let destFields = ['userName'];
      self.globalData.transformStaffEntity(inputField, valueFields, destFields, userIdEntry, 'cgIp').then((data) => {
        self.cdUserName = _.map(data, (e) => e['userName']).join(',');
      });
    }
  }
  //获取金额配置段
  currAmount(entry) {
    var self = this;
    if (!!entry && !!entry.flowSaveParDto.flowInstId) {
      //有流程实例ID，限制金额段
      var amount = entry.bizEntity.contractPrice;
      self.http.post(ENV.httpurlscm + getAmountConfigUri, {}).subscribe(resp => {
        // self.$http.post(getAmountConfigUri).then((resp) => {
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
  //获取附件信息
  getFileList() {
    this.http.get(ENV.httpurlscm + fileSearchUri + this.editingEntry.bizEntity.id).subscribe(data => {
      this.fileList = data;
    })
  }
  getDisFis() {
    var self = this;
    if (self.point.hasOwnProperty('lockFileds')) {
      self.lockfileds = self.point.lockFileds;
    }
    if (!self.lockfileds) {
      self.lockfileds = "";
    }
  }
  getOpions() {
    return new Promise(async (resolve, reject) => {
      var self = this;
      //采购类型
      await self.http.post(ENV.httpurlscm + opionsUri, { dictCode: 'SCM_APPLYORCONTRACT_TYPE' }).subscribe(resp => {
        self.purchaseTypeList = resp;
        _.map(self.purchaseTypeList, (d) => {
          if (d.optionValue === self.editingEntry.bizEntity.purchaseType) {
            self.editingEntry.bizEntity.purchaseTypeName = d.optionName;
          }
          resolve(self.editingEntry)
        });
      });

      //采购来源
      await self.http.post(ENV.httpurlscm + opionsUri, { dictCode: 'SBM_PURCHASE_SOURCE' }).subscribe(resp => {
        self.purchaseSourceList = resp;
        _.map(self.purchaseSourceList, (d) => {
          if (d.optionValue === self.editingEntry.bizEntity.purchaseSource) {
            self.editingEntry.bizEntity.purchaseSourceName = d.optionName;
          }
          resolve(self.editingEntry)
        });
      });
      //采购执行单位
      await self.http.post(ENV.httpurlscm + opionsUri, { dictCode: 'SCM_APPLY_BM' }).subscribe(resp => {
        _.map(resp, (d) => {
          if (d['optionValue'] === self.editingEntry.bizEntity.operateDepartment) {
            self.editingEntry.bizEntity.operateDepartmentName = d['optionName'];
          }
          resolve(self.editingEntry)
        });
      });
      //供应商名称
      await self.http.post(ENV.httpurlscm + opionsUri, { dictCode: 'SCM_CHANNEL' }).subscribe(resp => {
        _.map(resp, (d) => {
          if (d['optionValue'] === self.editingEntry.bizEntity.ps.channel) {
            self.editingEntry.bizEntity.ps.channelName = d['optionName'];
          }
          resolve(self.editingEntry)
        });
      });
      //供应商名称
      await self.http.post(ENV.httpurlscm + opionsUri, { dictCode: 'SCM_BANK' }).subscribe(resp => {
        _.map(resp, (d) => {
          if (d['optionValue'] === self.editingEntry.bizEntity.ps.bank) {
            self.editingEntry.bizEntity.ps.bankName = d['optionName'];
          }
          resolve(self.editingEntry)
        });
      });
      //交货方式
      await self.http.post(ENV.httpurlscm + opionsUri, { dictCode: 'SCM_DELIVERY_TYPE' }).subscribe(resp => {
        _.map(resp, (d) => {
          if (d['optionValue'] === self.editingEntry.bizEntity.deliveryType) {
            self.editingEntry.bizEntity.deliveryTypeName = d['optionName'];
          }
          resolve(self.editingEntry)
        });
      });
      //采购方式
      await self.http.post(ENV.httpurlscm + opionsUri, { dictCode: 'EQU_PURCHASE_WAY' }).subscribe(resp => {
        _.map(resp, (d) => {
          if (d['optionValue'] === self.editingEntry.bizEntity.purchaseWay) {
            self.editingEntry.bizEntity.purchaseWayName = d['optionName'];
          }
          resolve(self.editingEntry)
        });
      });

      //是否有技术协议
      await self.http.post(ENV.httpurlscm + opionsUri, { dictCode: 'SYSTEM_BOOLEAN_STATE' }).subscribe(resp => {
        _.map(resp, (d) => {
          if (d['optionValue'] === self.editingEntry.bizEntity.technologyAgreement) {
            self.editingEntry.bizEntity.technologyAgreementName = d['optionName'];
          }
          resolve(self.editingEntry)
        });
      });
      //质保金方式
      await self.http.post(ENV.httpurlscm + opionsUri, { dictCode: 'SCM_GUARANTEE_WEY' }).subscribe(resp => {
        _.map(resp, (d) => {
          if (d['optionValue'] === self.editingEntry.bizEntity.guaranteeWay) {
            self.editingEntry.bizEntity.guaranteeWayName = d['optionName'];
          }
          resolve(self.editingEntry)
        });
      });
      //发票类型
      await self.http.post(ENV.httpurlscm + opionsUri, { dictCode: 'SCM_BILL_TYPE' }).subscribe(resp => {
        _.map(resp, (d) => {
          if (d['optionValue'] === self.editingEntry.bizEntity.billType) {
            self.editingEntry.bizEntity.billTypeName = d['optionName'];
          }
          resolve(self.editingEntry)
        });
      });
    })
  }
  getDataInformations() {
    this.http.post(ENV.httpurlscm + this.readSubUri, this.getParams()).subscribe(data => {
      console.log(data);
      this.dataInformations = data;
      this.interceptorSub(data);
    })
  }
  //计算课题总金额
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
  //获取意见表
  getOpinionList() {
    let entity = this.navParams.get("entry")
    this.http.post(ENV.httpurlscm + readFlowOpinionUri + '/' + entity.flowInstId, {}).subscribe(resp => {
      this.opinionList = resp;
      // 处理手写签名
      // _.each(this.opinionList, o => {
      //   this.http.get(ENV.httpurlscm + '/stoneVfs/local/wfSignture/' + entity.flowInstId + '/' + o.DATAID + '.txt').subscribe(resp => {
      //     o.dataUrl = resp;
      //   }, error => console.log(error));
      // });
    }, () => { });
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
  viewFlow() {
    this.navCtrl.push("FlowprocessPage", { entry: this.navParams.get("entry") })
  }
  //选人
  selectStaffType(type) {
    var self = this;
    var uri = '';
    if (type === "cdUserName") {
      uri = roleStaffUri + roleIdOne;
    }
    let profileModal = this.modalCtrl.create('PagingSelectPage', { 'requesttype': 'get', 'type': null, 'url': uri, 'bizdata': null, });
    profileModal.onDidDismiss(selectedItem => {
      if (selectedItem) {
        if (type === "cdUserName") {
          self.cdUserName = selectedItem.userName;
          self.editingEntry.bizEntity.competentDeptUserID = selectedItem.userId;
        }
      }

      //做一次保存操作，用于保存选择的人员
      self.saveBizData(self.editingEntry.bizEntity);

    });
    profileModal.present();
  }

  saveBizData(entity) {
    return new Promise((resolve, reject) => {
      return this.http.post(ENV.httpurlscm + createUri2, entity).subscribe(resp => {
        resolve(resp);
      }, error => {

      })
    })
  }
}
