import { ENV } from '@env/environment';
import { globalData } from '../../../../icommon/provider/globalData';
import { NativeService } from '../../../../icommon/provider/native';
import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ModalController } from 'ionic-angular';

import { HttpClient } from '@angular/common/http';
import _ from 'lodash';
// import { Observable } from 'rxjs/Rx';
import {
  handleNewUri, handleUri, readSubUri, querySubColumn, fileSearchUri, getAmountConfigUri, opionsUri, readFlowOpinionUri, getMaxCodeUri, createUri, temporaryUri
  , readButtonUri, purchaseWayStatuss, readPointInfoUri, canSkipFlowPointZHB, canSkipFlowPoint, autoHandlePoint, roleIdOne, roleIdTwo, roleStaffUri, getDirectDeptStaffsUri
  , wfSigntureUri,
  createUri3
} from '../../../../icommon/provider/Constantscg';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import * as $ from 'jquery';
import 'rxjs/add/operator/timeout';
import { Events } from 'ionic-angular';
import { Keyboard } from '@ionic-native/keyboard';
@IonicPage()
@Component({
  selector: 'page-purchasefloweditor',
  templateUrl: 'purchasefloweditor.html',
})
export class PurchasefloweditorPage {
  fileList: any = [];
  @ViewChild('uploadImg') uploadImg: any;
  editingEntry: any = {};
  point: any = {};
  editable: boolean = false;
  dataInformations: any = [];
  totalAll: any;
  maxTotalAll: any;
  collspaed: boolean = true;
  httpurl: any;
  userinfor: any = {};
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
  draftsUserName2:any;
  chargeBusinessUserName: any;
  opinionList: any = [];
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
  entry: any = {};
  flowType: any;
  datamore:any ={};
  contractDraftingStaff:any;
  toggle:any;
  constructor(private events: Events,private keyboard: Keyboard,public modalCtrl: ModalController, public fb: FormBuilder, public globalData: globalData, public NativeService: NativeService, public http: HttpClient, private alerCtrl: AlertController, public navCtrl: NavController, public navParams: NavParams) {
    this.userinfor = JSON.parse(localStorage.getItem("objectList"));
    this.editable = this.navParams.get("bl");
    this.flowType = this.navParams.get("flowType");
    this.toggle = this.navParams.get("toggle");
    this.myForm = this.fb.group({
      opinion: ['', [Validators.required]],
    });
    this.entry = this.navParams.get("entry");
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
    this.http.post(ENV.httpurlscm + handleNewUri + '/' + dataId, {}).subscribe(async data => {
      await this.requestOrg(handleUri, dataId, data, this.navParams.get("bl"))
    })

  }
  // 原始的公共的发送请求的方法
  requestOrg(uri, params, entity, bl) {
    let that = this;
    this.http.post(ENV.httpurlscm + uri + '/' + params, {}).timeout(9000).subscribe(async data => {
     
      that.editingEntry = entity;
      that.point = data;

      await this.getDataInformations();//获取预算信息
      await this.getFileList();//加载附件信息
      await this.transformEntry(this.editingEntry.bizEntity);
      await this.getDisFis();// 获取不可编辑字段

      if (!!this.navParams.get("bl")) {
        await that.complex(that.editingEntry);
        await that.getOpions()
        await that.currAmount(that.editingEntry)
        // this.publicManage(that.editingEntry, true).subscribe(async (data) => {
        // })

      } else {
        await this.getOpions();// 获取下拉框的值
        await this.currAmount(this.editingEntry); //初始化获取限制金额段
      }
      this.NativeService.hideLoading();
    },error =>{
      this.NativeService.hideLoading();
    })
  }
  //获取金额配置段
  currAmount(entry) {
    return new Promise(async (resolve, reject) => {
      var self = this;

      if (!!entry && !!entry.flowSaveParDto.flowInstId) {
        //有流程实例ID，限制金额段
        var amount = entry.bizEntity.amount;
        self.http.post(ENV.httpurlscm + getAmountConfigUri, {}).subscribe(resp => {
          var amounts = resp;
          amount = Math.floor(amount * 100) / 100;
          if (Number(amount) <= amounts['firstAmount']) {
            self.currAmounts = {
              minAmount: 0,
              maxAmount: amounts['firstAmount']
            };
            resolve(self.currAmounts)
          } else if (Number(amount) > amounts['firstAmount'] && Number(amount) <= amounts['secondAmount']) {
            self.currAmounts = {
              minAmount: amounts['firstAmount'],
              maxAmount: amounts['secondAmount']
            };
            resolve(self.currAmounts)
          } else if (Number(amount) > amounts['secondAmount'] && Number(amount) <= amounts['thirdAmount']) {
            self.currAmounts = {
              minAmount: amounts['secondAmount'],
              maxAmount: amounts['thirdAmount']
            };
            resolve(self.currAmounts)
          } else if (Number(amount) > amounts['thirdAmount'] && Number(amount) <= amounts['fourthAmount']) {
            self.currAmounts = {
              minAmount: amounts['thirdAmount'],
              maxAmount: amounts['fourthAmount']
            };
            resolve(self.currAmounts)
          } else if (Number(amount) > amounts['fourthAmount']) {
            self.currAmounts = {
              minAmount: amounts['fourthAmount'],
              maxAmount: ''
            };
            resolve(self.currAmounts)
          }
        });
      } else {
        self.currAmounts = {};
        resolve(self.currAmounts)
      }

    })


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
        // this.contractDraftingStaff =  d.optionValue === "bmzx" ? this.editingEntry.bizEntity.contractDraftingStaff :'';
        
        // if(d.optionValue === "bmzx"){
        //   console.log(this.editingEntry.bizEntity)
        //   // this.editingEntry.bizEntity.contractDraftingStaff = this.editingEntry.bizEntity.applicant;
        //   // this.draftsUserName = this.editingEntry.bizEntity.userName;
        // }else{
        //   this.editingEntry.bizEntity.contractDraftingStaff = "";
        //   this.draftsUserName = "";
        //    //做一次保存操作，用于保存选择的人员
        //   this.saveBizData(this.editingEntry.bizEntity);
        // }
      }
       //做一次保存操作，用于保存选择的人员
        // this.saveBizData(this.editingEntry.bizEntity);
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
    return new Promise(async (resolve, reject) => {
      var self = this;
      //是否需要招标备案
      await self.http.post(ENV.httpurlscm + opionsUri, { dictCode: 'SYSTEM_BOOLEAN_STATE' }).subscribe(resp => {
        self.tenderRecordList = resp;
        _.map(self.tenderRecordList, (d) => {
          if (d.optionValue === self.editingEntry.bizEntity.tenderRecord) {
            self.editingEntry.bizEntity.tenderRecordName = d.optionName;
          }
          resolve(self.editingEntry)
        });

      });
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
      //资产用途
      await self.http.post(ENV.httpurlscm + opionsUri, { dictCode: 'EQU_ASSET_PURPOSE' }).subscribe(resp => {
        self.assetPurposeList = resp;
        _.map(self.assetPurposeList, (d) => {
          if (d.optionValue === self.editingEntry.bizEntity.assetPurpose) {
            self.editingEntry.bizEntity.assetPurposeName = d.optionName;
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
      //是否研制子资产
      await self.http.post(ENV.httpurlscm + opionsUri, { dictCode: 'SYSTEM_BOOLEAN_STATE' }).subscribe(resp => {
        self.developSubassetsList = resp;
        _.map(self.developSubassetsList, (d) => {
          if (d.optionValue === self.editingEntry.bizEntity.developSubassets) {
            self.editingEntry.bizEntity.developSubassetsName = d.optionName;
          }
          resolve(self.editingEntry)
        });

      });
      //所属项目
      await self.http.post(ENV.httpurlscm + opionsUri, { dictCode: 'SCM_YQ_PROJECT' }).subscribe(resp => {
        self.projectList = resp;
        _.map(self.projectList, (d) => {
          if (d.optionValue === self.editingEntry.bizEntity.project) {
            self.editingEntry.bizEntity.projectName = d.optionName;
          }
          resolve(self.editingEntry)
        });

      });
      //合同起草部门
      await self.http.post(ENV.httpurlscm + opionsUri, { dictCode: 'SCM_APPLY_BM' }).subscribe(resp => {
        self.draftingDeptList = resp;
        _.map(self.draftingDeptList, (d) => {
          if (d.optionValue === self.editingEntry.bizEntity.draftingDept) {
            self.editingEntry.bizEntity.draftingDeptName = d.optionName;
            this.editingEntry.bizEntity.draftingDept = d.optionValue;
          }
          resolve(self.editingEntry)
        });

      });
      //建议采购方式
      await self.http.post(ENV.httpurlscm + opionsUri, { dictCode: 'EQU_PURCHASE_WAY' }).subscribe(resp => {
        self.purchaseWayList = resp;
        _.map(self.purchaseWayList, (d) => {
          if (d.optionValue === self.editingEntry.bizEntity.purchaseWay) {
            self.editingEntry.bizEntity.purchaseWayName = d.optionName;
          }
          resolve(self.editingEntry)
        });

      });
    })

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
      let userIdEntry = _.map(userIds, (id) => {
        return {
          userId: id
        };
      });
      let inputField = 'userId';
      let valueFields = ['userName'];
      let destFields = ['userName'];
      let a = self.globalData.transformStaffEntity(inputField, valueFields, destFields, userIdEntry, 'cgIp').then((data) => {
        self.cdUserName = _.map(data, (e) => e['userName']).join(',');
      });
    }
    if (entry.chargeBusinessUserID) {
      let userIds = entry.chargeBusinessUserID.split(',');
      let userIdEntry = _.map(userIds, (id) => {
        return {
          userId: id
        };
      });
      let inputField = 'userId';
      let valueFields = ['userName'];
      let destFields = ['userName'];
      self.globalData.transformStaffEntity(inputField, valueFields, destFields, userIdEntry, 'cgIp').then((data) => {
        self.cbUserName = _.map(data, (e) => e['userName']).join(',');
      });
    }

    if (entry.contractDraftingStaff) {
      let userIds = entry.contractDraftingStaff.split(',');
      let userIdEntry = _.map(userIds, (id) => {
        return {
          userId: id
        };
      });
      let inputField = 'userId';
      let valueFields = ['userName'];
      let destFields = ['userName'];
      self.globalData.transformStaffEntity(inputField, valueFields, destFields, userIdEntry, 'cgIp').then((data) => {
        self.draftsUserName = _.map(data, (e) => e['userName']).join(',');
        self.draftsUserName2 =   self.draftsUserName;
      });
    }

    if (entry.chargeBusinessUserID) {
      let userIds = entry.chargeBusinessUserID.split(',');
      let userIdEntry = _.map(userIds, (id) => {
        return {
          userId: id
        };
      });
      let inputField = 'userId';
      let valueFields = ['userName'];
      let destFields = ['userName'];
      self.globalData.transformStaffEntity(inputField, valueFields, destFields, userIdEntry, 'cgIp').then((data) => {
        self.chargeBusinessUserName = _.map(data, (e) => e['userName']).join(',');
      });
    }
    let clzName1 = 'com.stonewomb.common.entity.Organization';
    let inputField1 = 'orgCode';
    let indexedField1 = 'orgId';
    let valueFields1 = ['deptId'];
    let destFields1 = ['deptId'];

    self.globalData.transformEntity(clzName1, inputField1, indexedField1, valueFields1, destFields1, [self.editingEntry.bizEntity], 'cgIp').then(
      (data) => {
        self.editingEntry.bizEntity = data['length'] > 0 ? data[0] : self.editingEntry.bizEntity;
        let inputField2 = 'deptId';
        let valueFields2 = ['deptName'];
        let destFields2 = ['deptName'];
        self.globalData.transformDeptEntity(inputField2, valueFields2, destFields2, [self.editingEntry.bizEntity], 'cgIp');
      }
    );
  }

  //获取预算信息
  getDataInformations() {
    this.http.post(ENV.httpurlscm + readSubUri + '/' + this.editingEntry.bizEntity.id, this.getParams()).subscribe(data => {
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
  //获取附件信息
  getFileList() {
    this.http.get(ENV.httpurlscm + fileSearchUri + this.editingEntry.bizEntity.id + '/file').subscribe(data => {
      this.fileList = data;
    })
  }
  // 上传文件
  // uploadFile(ev) {
  //   let formData = new FormData();
  //   formData.append('files', ev.target.files[0]);
  //   formData.append('filePath', 'file');

  //   this.http.post(ENV.httpurl + '/stoneVfs/local/', formData).subscribe(data => {
  //     this.uploadImg.nativeElement.value = ''
  //     if (!data['objBean']) {
  //       this.NativeService.showAlert('文件上传失败！');
  //     } else {
  //       this.fileList.push(data['objBean']);
  //     }
  //   }, error => {
  //     console.log(error)
  //   })
  // }
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
  removeFile(item, i) {
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
            this.http.delete(ENV.httpurlscm + item.url).subscribe(data => {
              this.fileList.splice(i, 1);
              // _.remove(this.fileList, (file) => {
              //   return file['id'] == item.id;
              // });
            })

          }
        }
      ]
    }).present();
  }
  viewFlow() {
    this.navCtrl.push("FlowprocessPage", { entry: this.navParams.get("entry") })
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
  //公共验证提交方法  -- 验证是否是草稿 -- 没有flowDefId说明是业务草稿
  publicManage(entry, type) {
    // return Observable.create(observer => {
    // let that = this;
    // observer.next(that.hah(entry, type))
    // Observable.defer(async function () {
    //   await that.getOpions()
    //   await that.currAmount(that.editingEntry)
    // }).subscribe(data => {
    //   observer.next(that.hah(entry, type))

    // })
    // })
    var self = this;
    if (!self.publicGetAmount(entry)) {
      //验证未通过
      if (!!!self.currAmounts.maxAmount) {
        let msg = "预测总额必须大于" + self.currAmounts.minAmount + "元";
        this.NativeService.showAlert(msg);
        return false;
      } else {
        let msg = "预测总额必须在" + self.currAmounts.minAmount + "元 ~ " + self.currAmounts.maxAmount + '元内！';
        this.NativeService.showAlert(msg);
        return false;
      }
    } else {
      var internalFun = () => {
        if (type && !entry.flowSaveParDto.flowDefId) {
          self.checkAmount(entry.bizEntity.amount).then((flowDefId) => {
            if (type && flowDefId == "0") {
              this.NativeService.showAlert("请输入正确的预测总额！");
              return false;
            }
            entry.flowSaveParDto.flowDefId = flowDefId;
            pulicGetCode(entry, type);
          });
        } else {
          pulicGetCode(entry, type);
        }
      };
      //--- 验证是否需要获取最新编号
      var pulicGetCode = (entry, type) => {
        var self = this;
        if (!!!entry.bizEntity.detail.paCode) {
          self.getCode().then(data => {
            entry.bizEntity.detail.paCode = data['code'];
            self.editingEntry.bizEntity.detail.paCode = data['code'];
            publicForward(entry, type);
          });
        } else {
          publicForward(entry, type);
        }
      }
      //验证需要进行的跳转操作
      var publicForward = (data, type) => {
        var self = this;
        if (type) {
          if (data.bizEntity.subjectFunding !== data.bizEntity.amount) {
            this.NativeService.showAlert("课题资金和预测总额不一致！");
            return false;
          }
          // self.complex(data);
        } else {
          cre(data.bizEntity);
        }
      }
      var cre = (entry) => {
        var self = this;
        return self.http.post(ENV.httpurlscm + createUri, entry, {}).subscribe(resp => {
          if (resp && resp !== null) {
            self.editingEntry.bizEntity = resp;
            self.transformEntry(self.editingEntry.bizEntity);
            this.NativeService.showAlert("暂存成功")
          }

        });
      }
      // 草稿并且没选主管部门项目管理员时选人
      if (entry.bizEntity.subjectFunding > 0 && !self.point && !entry.bizEntity.competentDeptUserID) {
        this.NativeService.showAlert("请选择主管部门经办人！");
        return false;
      } else if (entry.bizEntity.subjectFunding > 100000 && !!self.point && self.point.sequence === 3 && !entry.bizEntity.chargeBusinessUserID) {
        // 当环节entity不为空、环节等于3并且分管业务中心所领导为空的时候
        this.NativeService.showAlert("请选择分管业务中心所领导！");
        return false;
      } else if (self.editable && !(self.lockfileds.indexOf('purchaseType') >= 0 || !!!self.point || self.point.sequence === 1) && !self.editingEntry.bizEntity.purchaseTypeName) {
        this.NativeService.showAlert("请选择采购类型！");
        return false;
      } else if (self.editable && !(self.lockfileds.indexOf('purchaseType') >= 0 || !!!self.point || self.point.sequence === 1) && !self.editingEntry.bizEntity.draftingDeptName) {
        this.NativeService.showAlert("请选择合同起草部门！");
        return false;
      } else if (self.editable && self.lockfileds.indexOf('purchaseWay') < 0 && !self.editingEntry.bizEntity.purchaseWayName) {
        this.NativeService.showAlert("请选择建议采购方式！");
        return false;
      }
      else {
        internalFun();
      }
    }
    return true;
  }

  //验证金额段
  checkAmount(amount) {
    var self = this;
    return new Promise((resolve, reject) => {
      return self.http.post(ENV.httpurlscm + getAmountConfigUri, {}).subscribe(async resp => {
        var amounts = {};
        amount = Math.floor(amount * 100) / 100;
        let data;
        if (Number(amount) <= amounts['firstAmount']) {
          data = "c6fb53c8959e432fab90f54299e8be8";
        } else if (Number(amount) > amounts['firstAmount'] && Number(amount) <= amounts['secondAmount']) {
          data = "c6fb53c8959e432fab90f54299e8be8";
        } else if (Number(amount) > amounts['secondAmount'] && Number(amount) <= amounts['thirdAmount']) {
          data = "c6fb53c8959e432fab90f54299e8bc6";
        } else if (Number(amount) > amounts['thirdAmount'] && Number(amount) <= amounts['fourthAmount']) {
          data = "c6fb53c8959e432fab90f54299e8bd7";
        } else if (Number(amount) > amounts['fourthAmount']) {
          data = "c6fb53c8959e432fab90f54299e8bb5";
        }
        await resolve(data);
        // return "0";
      }, error => {
        reject(error);
      });
    })

  }
  //--- 验证预测钱的正确性（在当前流程的范围内）
  publicGetAmount(entry) {
    var self = this;
    var amount = entry.bizEntity.amount;
    if (!!entry && !!entry.flowSaveParDto.flowInstId) {
      if (!!!self.currAmounts) {
        return true;
      } else if (!!self.currAmounts && !self.currAmounts.maxAmount) {
        return Number(amount) > self.currAmounts.minAmount;
      } else {
        return Number(amount) > self.currAmounts.minAmount && Number(amount) <= self.currAmounts.maxAmount;
      }
    } else {
      return true;
    }
    // return true;
  }


  //获取编号
  getCode() {
    return new Promise((resolve, reject) => {
      return this.http.post(ENV.httpurlscm + getMaxCodeUri, {}).subscribe(resp => {
        resolve(resp);
      }, error => {
        reject();
      }) // 出错，返回空对象);
    })
  }

  // 复杂提交
  complex(entry) {
    var self = this;
    // if (entry.bizEntity.subjectFunding !== entry.bizEntity.amount) {
    //   this.NativeService.showAlert("课题资金和预测总额不一致！");
    //   return;
    // }
    this._bizParams = entry.bizMap && entry.bizMap.bizStatus == 'create' ? {
      params: {
        status: '0'
      }
    } : {};
    self.request(ENV.httpurlscm + temporaryUri, self.bizToFolwTitle(entry))
      .then(async data => {
        this.hjenty = data;
        await this.getDefaultOpinion();
        await this.getPointInfo();
      }, error => console.log(error));

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
        }, error => {

        })
    })
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
  //获取默认的办理意见
  getDefaultOpinion() {
    var self = this;
    self.OPINION_TITLE = '同意';
    if (self.hjenty.flowSaveParDto.flowInstName === '采购经办人' && !self.hjenty.bizEntity.caCode) {
      self.OPINION_TITLE = '同意，建议进行【' + purchaseWayStatuss[self.hjenty.bizEntity.purchaseWay] + '】';
    }
  }
  // 组装数据到flowData的title里
  bizToFolwTitle(entries) {
    // var self = this;
    let title = entries.bizEntity;
    entries.flowSaveParDto.dataTitle = JSON.stringify(title);

    delete entries.bizEntity.userName;
    delete entries.bizEntity.deptName;
    return entries;
    // title.SYSTEM_FLOW_STATUS = ;// 状态
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
  // 自定义按钮的提交
  manage(btn, opinionTitle) {

    if (this.publicManage(this.editingEntry, true)) {
      var self = this;
      let entryParam = self.combParam(btn.param, opinionTitle);
      if (btn.type === 'DELEGATION') {
        // 如果是转发类型的按钮
        //if (self.currentPoint.POPWINDOW === '1') {
        // 公用的选人弹框，转发要机构选人，不用btn里的参数
        self.selectPartIn(btn, entryParam, self.currentPoint);
      } else if (btn.type === 'SUBMIT') { // 如果是提交类型的按钮，判断当前环节是否是最后一个环节
        if (self.isLastPoint(self.currentPoint)) { // 是最后一个环节
          self.NativeService.showAlert('最后一个环节不能【提交】，只能【办结】或者【退回】！');
        } else { // 判断下一个环节是否需要弹框选人
          if (self.isSelectPartIn(self.currentPoint)) { // 需要，则弹框选人后，组合partInUserId参数到entry，再发送请求
            // FIXME:公用的选人弹框
            self.selectPartIn(btn, entryParam, self.nextPoint);
          } else { // 不需要，直接发送请求
            self.sendReq(btn, entryParam);
          }
        }
      } else { // 其他类型的自定义按钮，不需要弹框选人
        if (btn.type === 'ROLEBACK' && self.isFirstPoint(self.currentPoint)) { // 如果是退回按钮，是第一个环节不能退回
          self.NativeService.showAlert('第一个环节不能【退回】！');
        }
        if (btn.type === 'ROLEBACK' && self.OPINION_TITLE === '同意') { // 如果是退回按钮，是第一个环节不能退回
          self.OPINION_TITLE = '';
          self.NativeService.showAlert('请填写办理意见！');
        } else { // 直接发送请求
          // TODO 如果是非'提交、退回、办结'按钮，暂时做同样处理
          self.sendReq(btn, entryParam);
        }
      }
    }
  }
  /**
    * 判断point是否是最后一个环节
    * @param  {Object}  point 选中的环节
    * @return {Boolean}       true--是，false--不是
    */
  isLastPoint(point) {
    var self = this;
    // 获取最后一个环节
    self.lastPoint = self.points[self.points.length - 1];
    return point.SEQ === self.lastPoint.SEQ;
  }
  /**
   * 判断point是否是第一个环节
   * @param  {Object}  point 环节
   * @return {Boolean}       true--是，false--不是
   */
  isFirstPoint(point) {
    var self = this;
    // 获取第一个环节
    self.firstPoint = self.points[0];
    return point.SEQ === self.firstPoint.SEQ;
  }
  /**
     * 发送请求
     * @param  {Object} btn        选中的自定义按钮
     * @param  {Object} entryParam 组合的参数
     * @return {[type]}            发送请求后，返回上一页面
     */
  sendReq(btn, entryParam) {
    var self = this;
    entryParam.autoHandlePointIds = [];
    //获取下一环节的title若再自动办理内进行以下操作。若不在进行之前的逻辑
    //获取nextPoint,若nextPoint是属于自动办理环;获取把btn.选人接口。办理人；若办理人==当前环节办理人，则pointId加入entryParam
    //若不属于或者已达到最后一个环节，则进行下边的环节;
    let tmpNextPoint = _.find(self.points, (n) => n.SEQ === self.currentPoint.SEQ + 1);
    let entryParamPromise = $.Deferred();
    self.nexthandleUser = entryParam.participants;
    //next1环节
    if (!!tmpNextPoint && _.includes(autoHandlePoint.pointTitles, tmpNextPoint.TITLE)) {
      // if (true) {
      self.getButton(self.currentPoint.POINTID).then(btns => {
        var submitBtn = _.find(btns, (n) => n['type'] === "SUBMIT");
        if (!submitBtn) {
          entryParamPromise.resolve();
          return;
        }
        var posUrl = submitBtn['actorUri'] + '/' + tmpNextPoint.POINTID;
        var params = Object.assign({}, () => _.zipObject(_.map(submitBtn['actorParams'], 'key'), _.map(submitBtn['actorParams'], 'value')) || {}, {
          bizdata: self.hjenty
        });
        return new Promise((resolve, reject) => {
          return self.http.post(ENV.httpurlscm + posUrl, params)
            .subscribe(resp => {
              resolve(resp);
            }, error => {
              reject(error)
            })
        })
      }).then((users) => {
        if (!!users && users['length'] > 0) {
        }
        //next2环节
        let tmpNext2Point = _.find(self.points, (n) => n.SEQ === self.currentPoint.SEQ + 2);
        if (!!tmpNext2Point && _.includes(autoHandlePoint.pointTitles, tmpNext2Point.TITLE)) {
          self.getButton(tmpNextPoint.POINTID).then((btns) => {
            var submitBtn = _.find(btns, (n) => n['type'] === "SUBMIT");
            if (!submitBtn) {
              entryParamPromise.resolve();
              return;
            }
            var posUrl = submitBtn['actorUri'] + '/' + tmpNext2Point.POINTID;
            var params = Object.assign({}, () => _.zipObject(_.map(submitBtn['actorParams'], 'key'), _.map(submitBtn['actorParams'], 'value')) || {}, {
              bizdata: self.hjenty
            });
            return new Promise((resolve, reject) => {
              return self.http.post(ENV.httpurlscm + posUrl, params)
                .subscribe(resp => {
                  resolve(resp);
                }, error => {
                  reject(error)
                })
            })
          }).then((users) => {
            if (!!users && users['length'] > 0) {
              if (_.isEqual(self.nexthandleUser, users[0].userId)) {
                entryParam.autoHandlePointIds.push(tmpNext2Point.POINTID);
                //next3环节
                let tmpNext3Point = _.find(self.points, (n) => n.SEQ === self.currentPoint.SEQ + 3);
                if (!!tmpNext3Point && _.includes(autoHandlePoint.pointTitles, tmpNext3Point.TITLE)) {
                  self.getButton(tmpNext2Point.POINTID).then((btns) => {
                    var submitBtn = _.find(btns, (n) => n['type'] === "SUBMIT");
                    if (!submitBtn) {
                      entryParamPromise.resolve();
                      return;
                    }
                    var posUrl = submitBtn['actorUri'] + '/' + tmpNext3Point.POINTID;
                    var params = Object.assign({}, () => _.zipObject(_.map(submitBtn['actorParams'], 'key'), _.map(submitBtn['actorParams'], 'value')) || {}, {
                      bizdata: self.hjenty
                    });
                    return new Promise((resolve, reject) => {
                      return self.http.post(ENV.httpurlscm + posUrl, params)
                        .subscribe(resp => {
                          resolve(resp);
                        }, error => {
                          reject(error)
                        })
                    })
                  }).then((users) => {
                    if (!!users && users['length'] > 0) {
                      if (_.isEqual(self.nexthandleUser, users[0].userId)) {
                        entryParam.autoHandlePointIds.push(tmpNext3Point.POINTID);
                        entryParamPromise.resolve();
                      } else {
                        entryParamPromise.resolve();
                      }
                    }
                  });
                } else {
                  entryParamPromise.resolve();
                }
              } else {
                entryParamPromise.resolve();
              }
            }
          });
        } else {
          entryParamPromise.resolve();
        }
      });
    } else {
      entryParamPromise.resolve();
    }
    $.when([entryParamPromise.promise]).then(() => {
      self.http.post(ENV.httpurlscm + btn.api, entryParam).subscribe(resp => {
        if (resp) {
          if (self.dataUrl) {
            self.saveSignture().then(() => {
              this.navCtrl.pop();
            }, resp => console.error(resp));
          } else {
            this.navCtrl.pop();
          }
        }
      }, error => console.log(error))
    });
  }
  // 保存签名
  saveSignture() {
    var self = this;
    var path = '/wfSignture/' + self.hjenty.flowSaveParDto.flowInstId + '/' + self.hjenty.flowSaveParDto.dataId + '.txt?asFile=true'; // 当前文件名
    var formData = new FormData();
    formData.append('file', self.dataUrl);
    return new Promise((resolve, reject) => {
      return this.http.post(ENV.httpurlscm + wfSigntureUri + path, formData, { headers: { 'Content-Type': undefined } }).subscribe(resp => {
        resolve(resp);
        self.testRe = resp;
      }, error => {
        reject(error);
      }) // 出错，返回空对象);
    })
  }

  /**
    * 判断point的下一个环节是否需要弹框选人
    * @param  {Object}  point 环节
    * @return {Boolean}       true--需要，false--不需要
    */
  isSelectPartIn(point) {
    var self = this;
    // 验证是否在跳“课题负责人”环节的范围内
    var canSkipPointCheckDept = _.includes(canSkipFlowPoint.deptIds, this.userinfor.deptTo.deptId);
    var nextPointInfo = _.find(self.points, (n) => n.SEQ === point.SEQ + 1);
    // 验证登陆人的部门是否为配置中的不可跳过该环节的部门
    if (canSkipPointCheckDept) {
      // 验证通过“课题负责人”环节不可跳过。
      self.nextPoint = _.find(self.points, (n) => n.SEQ === point.SEQ + 1);
    } else {
      // 验证未通过，可以跳过; 再次验证下一环节是否为“课题负责人”，如果是就跳过，如果不是则正常执行;
      self.nextPoint = _.includes(canSkipFlowPoint.pointNames, nextPointInfo.TITLE) ? _.find(self.points, (n) => n.SEQ === point.SEQ + 2) : _.find(self.points, (n) => n.SEQ === point.SEQ + 1);
    }

    // 验证是否为综合办 并且 当前环节不为“申请人”环节。
    if (self.specialDept && point.SEQ > 2) {
      // 验证下一环节是否为“主管部门负责人”
      if (_.includes(canSkipFlowPointZHB.ignoredPointName, nextPointInfo.TITLE)) {
        self.ignoredPoint = _.find(self.points, (n) => n.SEQ === point.SEQ + 2); // 采购办项目负责人(申请) or 分管业务中心所领导(合同)
        self.nextPoint = _.find(self.points, (n) => n.SEQ === point.SEQ + 1); // 主管部门负责人
      } else {
        self.ignoredPoint = null;
        self.nextPoint = _.find(self.points, (n) => n.SEQ === point.SEQ + 1);
      }
    }

    if (self.nextPoint.POPWINDOW === '1') {
      return true;
    } else {
      return false;
    }

    // //获取环节point的下一个环节
    // self.nextPoint = _.find(self.points, (n) => n.SEQ === point.SEQ + 1);
    // return self.nextPoint.POPWINDOW === '1';
  }
  /**
    * 需要公用的弹框选人，组合参数userID，发送请求
    * @param  {Object} btn        选中的自定义按钮
    * @param  {Object} entryParam 已经组合的entry + 意见 + btn.param 参数
    * @param  {Object} point      要提交到的哪一个环节
    * @param  {Boolean} isBtnSel  是否是btn里接口选人，默认true
    * @return {[type]}            发送请求
    */
  selectPartIn(btn, entryParam, point, isBtnSel = true) {
    var self = this;
    // 如果是btn选人，则从btn与point里组装参数，如果不是，则直接调用选人服务即可
    let request = null;
    if (isBtnSel) {
      self.getUsers2(btn, entryParam, point).then((users) => {
        if (_.isArray(users) && users['length'] === 1) {
          let userEntry = users[0];
          this.alerCtrl.create({
            title: '确定提交至【' + userEntry.userName + '】办理吗？',
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
                  self.selectPatrIn = users;
                  self.partInUserId = _.map(self.selectPatrIn, 'userId').join(',');
                  console.debug('参与者self.partInUserId ...', self.partInUserId);
                  entryParam.participants = self.partInUserId;
                  self.sendReq(btn, entryParam);
                }
              }
            ]
          }).present();
        } else {
          var defultEntity = null;
          var defultEntityPromise = $.Deferred();
          self.getUsers(btn, entryParam, point).then((data) => {
            if (!!_.isArray(data) && data['length'] > 0) {
              self.http.get(ENV.httpurlscm + '/api/staff/getStaffInfoByUserid/' + data[0]).subscribe(resp => {
                defultEntity = resp;
                defultEntityPromise.resolve();
              }, () => {
                defultEntityPromise.resolve();
              });
            } else {
              defultEntityPromise.resolve();
            }
          }, () => {
            defultEntityPromise.resolve();
          });
          $.when([defultEntityPromise.promise]).then(() => {
            let readUri = btn.actorUri + '/' + point.POINTID;
            let bizdata = { bizdata: self.hjenty };
            let actorParams = _.zipObject(_.map(btn.actorParams, 'key'), _.map(btn.actorParams, 'value'));
            self.selectStaff(bizdata, actorParams, readUri, defultEntity, entryParam, btn);
          });
        }

      });
    } else {
      // self.$swMobiSelectStaff.selectStaff(request).then((selectedItem) => {
      //   // 将发送请求的参数放入全局
      //   self.selectPatrIn = selectedItem;
      //   self.partInUserId = _.map(self.selectPatrIn, 'userId').join(',');
      //   console.debug('参与者self.partInUserId ...', self.partInUserId);
      //   entryParam.participants = self.partInUserId;
      //   self.sendReq(btn, entryParam);
      // });
    }
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
          self.draftsUserName2 = selectedItem.userName;
          self.editingEntry.bizEntity.contractDraftingStaff = selectedItem.userId;
        } else if (type === "chargeBusinessUserName") {
          self.chargeBusinessUserName = selectedItem.userName;
          self.editingEntry.bizEntity.chargeBusinessUserID = selectedItem.userId;
        }
      }

      //做一次保存操作，用于保存选择的人员
      self.saveBizData(self.editingEntry.bizEntity);

    });
    profileModal.present();
  }



  //保存业务数据
  saveBizData(entity) {
    return new Promise((resolve, reject) => {
      return this.http.post(ENV.httpurlscm + createUri,entity).subscribe(resp => {
        resolve(resp);
        }, error => {

        })
    })

  }





  selectStaff(bizdata, actorParams, readUri, defultEntity, entryParam, btn) {
    var self = this;
    Object.assign(bizdata, actorParams || {});
    let profileModal = this.modalCtrl.create('PagingSelectPage', { 'requesttype': 'post', 'type': null, 'url': readUri, 'bizdata': bizdata, });
    profileModal.onDidDismiss(data => {
      if (data) {
        self.selectPatrIn = data;
        self.partInUserId = self.selectPatrIn.userId;
        entryParam.participants = self.partInUserId;
        self.sendReq(btn, entryParam);
      }
    });
    profileModal.present();
  }
  getUsers2(btn, entryParam, point) {
    var self = this;
    var posUrl = btn.actorUri + '/' + point.POINTID;
    var params = Object.assign({}, () => _.zipObject(_.map(btn.actorParams, 'key'), _.map(btn.actorParams, 'value')) || {}, {
      bizdata: self.hjenty
    });
    return new Promise((resolve, reject) => {
      return this.http.post(ENV.httpurlscm + posUrl, params).subscribe(resp => {
        resolve(resp);
      }, error => {
        reject(error);
      }) // 出错，返回空对象);
    })
  }
  getUsers(btn, entryParam, point) {
    _.merge(btn, point);
    return new Promise((resolve, reject) => {
      return this.http.post(ENV.httpurlscm + '/api/flowExtend/getFlowPointUsers', {
        id: entryParam.pkValue,
        flowinstID: entryParam.flowInstId,
        currentPointId: entryParam.pointId,
        targetPointId: point.POINTID
      }).subscribe(resp => {
        resolve(resp);
      }, error => {
        reject(error);
      }) // 出错，返回空对象);
    })

  }
  /**
    * 组合参数，将意见放入self.hjenty，将btn.param参数解析后放入self.hjenty
    * @param  {String} param        btn.param
    * @param  {String} opinionTitle 意见
    * @return {Object}              entry
    */
  combParam(param, opinionTitle) {
    var self = this;
    let entryParam = self.hjenty.flowSaveParDto;
    entryParam.opinoinTitle = opinionTitle || '';
    let modeFlag = param.split('=');
    if (modeFlag.length > 0 && modeFlag[0] === 'modeFlag') {
      entryParam[modeFlag[0]] = modeFlag[1];
    } else {
      entryParam.personalityPar = param;
    }
    entryParam.noticeType = 'no';
    entryParam.noticeContent = '';
    return entryParam;
  }
  // 手写签名
  writingPad(dataUrl) {
    var self = this;
    // self.writingPadService.open(dataUrl).then(dataUrl2 => {
    //   self.dataUrl = dataUrl2;
    // });
  }
}
