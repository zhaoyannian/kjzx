import { ENV } from '@env/environment';
import { globalData } from '../../../../icommon/provider/globalData';
import { NativeService } from '../../../../icommon/provider/native';
import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ModalController } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import _ from 'lodash';
import {
  handleNewUri6, handleUri6, readSubUri, payReadUri, deliveryReadUri, querySubColumn, roleStaffUri, roleIdOne,roleIdTwo, fileSearchUri, getAmountConfigUri, opionsUri, readFlowOpinionUri, temporaryUri6
  , readButtonUri, purchaseWayStatuss, readPointInfoUri, createUri6
} from '../../../../icommon/provider/Constantscg';
import 'rxjs/add/operator/timeout';
import { Events } from 'ionic-angular';
import { Keyboard } from '@ionic-native/keyboard';

@IonicPage()
@Component({
  selector: 'page-entrustApply',
  templateUrl: 'entrustApply.html',
})
export class EntrustApplyPage {
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
  fileRwlist: any = [];
  editable: boolean = false;
  dataInformations: any = [];
  totalAll: any;
  maxTotalAll: any;
  collspaed: boolean = true;
  lockfileds: any;
  tenderRecordList: any = [];
  isImportedList: any = [];
  purchaseWayList: any = [];
  fundSourceList: any = [];
  draftingDeptList: any = [];
  projectList: any = [];
  developSubassetsList: any = [];
  purchaseTypeList: any = [];
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
  conInfo: any = true;
  toggle: any;
  sanitizer: any;
  @ViewChild('uploadImg') uploadImg: any;
  fileDeleteUri: string = "/api/stoneVfsApi/delete";
  constructor(private events: Events, private keyboard: Keyboard, public modalCtrl: ModalController, public fb: FormBuilder, public globalData: globalData, public NativeService: NativeService, public http: HttpClient, private alerCtrl: AlertController, public navCtrl: NavController, public navParams: NavParams, public DomSanitizer: DomSanitizer) {
    this.sanitizer = DomSanitizer;
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
      let that = this;
      that.keyboard.onKeyboardWillHide().subscribe(data => {
            console.log(data)
            if (that.NativeService.isAndroid()) {
                that.datamore.btnscroll = false;
                that.datamore.btnscollHeight = 0;
            }
        })
  }
  async init() {
    this.NativeService.showLoading();
    let dataId = this.navParams.get("entry").dataId;
    this.http.post(ENV.httpurlscm + handleNewUri6 + '/' + dataId, {}).subscribe(async data => {
      await this.requestOrg(handleUri6, dataId, data, this.navParams.get("bl"))
    })

  } // 原始的公共的发送请求的方法
  requestOrg(uri, params, entity, bl) {
    let that = this;
    this.http.post(ENV.httpurlscm + uri + '/' + params, {}).timeout(9000).subscribe(async data => {

      that.editingEntry = entity;
      that.point = data;

      await this.transformEntry(this.editingEntry);
      //加载附件信息
      await this.getFileList();

      await this.getRwFileList();

      // 获取不可编辑字段
      await this.getDisFis();

      // 获取下拉框的值
      await this.getOpions();
      //获取付款信息
      // await this.getpayInformations();

      // await this.getDeliveryPlanInfos();
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
    self.request(ENV.httpurlscm + temporaryUri6, self.bizToFolwTitle(entry))
      .then(async data => {
        this.hjenty = data;
        await this.getDefaultOpinion();
        await this.getPointInfo();
        // await this.saveBizData(this.editingEntry.bizEntity);
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
      self.OPINION_TITLE = '已收到';
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
  // getDeliveryPlanInfos() {
  //   let params = {};
  //   params = {
  //     params: {
  //       'page': 1,
  //       'pageSize': 1000
  //     },

  //   }

  //   this.http.post(ENV.httpurlscm + this.deliveryReadUri, this.getParams(), params).subscribe(data => {
  //     this.deliveryPlanInfos = data;
  //   })
  // }
  transformEntry(entry) {
    var self = this;
    var title = '项目委托申请管理';
    self.inittitle = title;
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

    //书面资料提交人</ion-label>

    let inputField3 = 'submitter';
    let valueFields3 = ['userName'];
    let destFields3 = ['submitterName'];
    self.globalData.transformStaffEntity(inputField3, valueFields3, destFields3, [self.editingEntry.bizEntity], 'cgIp');

    //参与评标用户代表</ion-label>

    let inputField4 = 'evaluUserId';
    let valueFields4 = ['userName'];
    let destFields4 = ['evaluUserName'];
    self.globalData.transformStaffEntity(inputField4, valueFields4, destFields4, [self.editingEntry.bizEntity], 'cgIp');

    //主管所领导 
    let inputField5 = 'chargeBusinessUserID';
    let valueFields5 = ['userName'];
    let destFields5 = ['chargeBusinessUserName'];
    self.globalData.transformStaffEntity(inputField5, valueFields5, destFields5, [self.editingEntry.bizEntity], 'cgIp').then((data) => {
        self.cdUserName = data[0].chargeBusinessUserName;
    });

    //业务主管部门经办人

    let inputField6 = 'competentDeptUserID';
    let valueFields6 = ['userName'];
    let destFields6 = ['competentDeptUserName'];
    self.globalData.transformStaffEntity(inputField6, valueFields6, destFields6, [self.editingEntry.bizEntity], 'cgIp');
  }

  //获取附件信息
  getFileList() {
    this.http.get(ENV.httpurlscm + fileSearchUri + this.editingEntry.bizEntity.id + '/file').subscribe(data => {
      this.fileList = data;
    })
  }
  //获取任务书关键页附件
  getRwFileList() {
    this.http.get(ENV.httpurlscm + fileSearchUri + this.editingEntry.bizEntity.id + '/filerw').subscribe(data => {
      this.fileRwlist = data;
      this.editingEntry.fileRwlist = this.fileRwlist;
    })
  }
  // 上传文件
  uploadFile(ev) {
    this.NativeService.showLoading();
    let formData = new FormData();
    formData.append('files', ev.target.files[0]);
    formData.append('filePath', 'file');
    let uploadurl = "/stoneVfs/local/" + this.editingEntry.bizEntity.id + '/filerw';
    let fileName = ev.target.files[0].name;
    let fileType = fileName.split(".")[1];

    this.http.post(ENV.httpurlscm + uploadurl, formData).subscribe(data => {
      this.NativeService.hideLoading();
      this.uploadImg.nativeElement.value = '';
      if (data['length'] <= 0) {
        this.NativeService.showAlert('文件上传失败！');
      } else {
        data[0].uri = ENV.httpurlscm + data[0].uri;
        data[0].uri = this.sanitizer.bypassSecurityTrustUrl(data[0].uri);
        let list = _.filter(this.fileRwlist,(file) =>{
          return file['name'] == data[0].name;
        });
        if(list.length <= 0){
          this.fileRwlist.push(data[0]);
        }
        this.editingEntry.fileRwlist = this.fileRwlist;
      }
    }, error => {
      this.NativeService.hideLoading();
      console.log(error)
    })

  }
  //删除附件
  deletePicture(item, i) {// 删除照片
    this.alerCtrl.create({
      title: '确认删除？',
      buttons: [{ text: '取消' },
      {
        text: '确定',
        handler: () => {
          let filePath = this.fileRwlist[i].uri.changingThisBreaksApplicationSecurity || this.fileRwlist[i].uri;
          let uri = filePath.substring(filePath.lastIndexOf("/stoneVfs"));
          if (!!uri) {
            this.http.post(ENV.httpurlscm + this.fileDeleteUri, { "path": uri }).subscribe(data => {
              _.remove(this.fileRwlist, (file) => {
                return file['name'] == item.name;
              });
              this.editingEntry.fileRwlist = this.fileRwlist;
            }, error => {
              _.remove(this.fileRwlist, (file) => {
                return file['name'] == item.name;
              });
              this.editingEntry.fileRwlist = this.fileRwlist;
            })
          }
        }
      }
      ]
    }).present();
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

  changepurchaseWay() {
    _.map(this.purchaseWayList, (d) => {
      if (d.optionValue === this.editingEntry.bizEntity.purchaseWay) {
        this.editingEntry.bizEntity.purchaseWayName = d.optionName;
      }
    });
  }

  changefundSource() {
    _.map(this.fundSourceList, (d) => {
      if (d.optionValue === this.editingEntry.bizEntity.fundSource) {
        this.editingEntry.bizEntity.fundSourceName = d.optionName;
      }
    });
  }


  getOpions() {
    return new Promise(async (resolve, reject) => {
      var self = this;
      //是否进口
      await self.http.post(ENV.httpurlscm + opionsUri, { dictCode: 'SCM_TECHNOLOGY_AGREEMENT' }).subscribe(resp => {
        self.isImportedList = resp;
        _.map(self.isImportedList, (d) => {
          if (d.optionValue === self.editingEntry.bizEntity.isImported) {
            self.editingEntry.bizEntity.isImportedName = d.optionName;
          }
          resolve(self.editingEntry)
        });
      });

      //申请采购方式
      await self.http.post(ENV.httpurlscm + opionsUri, { dictCode: 'SCM_WTPUR_WAY' }).subscribe(resp => {
        self.purchaseTypeList = resp;
        _.map(self.purchaseTypeList, (d) => {
          if (d.optionValue === self.editingEntry.bizEntity.purchaseType) {
            self.editingEntry.bizEntity.purchaseTypeName = d.optionName;
          }
          resolve(self.editingEntry)
        });
      });

      //建议采购方式
      self.http.post(ENV.httpurlscm + opionsUri, {
        dictCode: 'SCM_WTPUR_WAY'
      }).subscribe(resp => {
        self.purchaseWayList = resp;
        _.map(self.purchaseWayList, (d) => {
          if (d.optionValue === self.editingEntry.bizEntity.purchaseWay) {
            self.editingEntry.bizEntity.purchaseWayName = d.optionName;
          }
        });
      });
      //项目批复采购方式
      await self.http.post(ENV.httpurlscm + opionsUri, { dictCode: 'SCM_WTXMPF_WAY' }).subscribe(resp => {
        _.map(resp, (d) => {
          if (d['optionValue'] === self.editingEntry.bizEntity.projectApproType) {
            self.editingEntry.bizEntity.projectApproTypeName = d['optionName'];
          }
          resolve(self.editingEntry)
        });
      });
      //所属项目
      await self.http.post(ENV.httpurlscm + opionsUri, { dictCode: 'SCM_YQ_PROJECT' }).subscribe(resp => {
        _.map(resp, (d) => {
          if (d['optionValue'] === self.editingEntry.bizEntity.project) {
            self.editingEntry.bizEntity.projectName = d['optionName'];
          }
          resolve(self.editingEntry)
        });
      });

      await self.http.post(ENV.httpurlscm + opionsUri, { dictCode: 'SCM_ZJ_SOURCES' }).subscribe(resp => {
        _.map(resp, (d) => {
          if (d['optionValue'] === self.editingEntry.bizEntity.fundSource) {
            self.editingEntry.bizEntity.fundSourceName = d['optionName'];
          }
          resolve(self.editingEntry)
        });
      });
      //是否批复
      await self.http.post(ENV.httpurlscm + opionsUri, { dictCode: 'SCM_TECHNOLOGY_AGREEMENT' }).subscribe(resp => {
        _.map(resp, (d) => {
          if (d['optionValue'] === self.editingEntry.bizEntity.isApprove) {
            self.editingEntry.bizEntity.isApproveName = d['optionName'];
          }
          resolve(self.editingEntry)
        });
      });
    })
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
  select(){}
  //选人
  selectStaffType(type) {
    var self = this;
    var uri = '';
    if (type === "cdUserName") {
      uri = roleStaffUri + roleIdTwo;
    }
    let profileModal = this.modalCtrl.create('PagingSelectPage', { 'requesttype': 'get', 'type': null, 'url': uri, 'bizdata': null, });
    profileModal.onDidDismiss(selectedItem => {
      if (selectedItem) {
        if (type === "cdUserName") {
          self.cdUserName = selectedItem.userName;
          self.editingEntry.bizEntity.chargeBusinessUserID = selectedItem.userId;
        }
      }

      //做一次保存操作，用于保存选择的人员
      self.saveBizData(self.editingEntry.bizEntity);

    });
    profileModal.present();
  }

  saveBizData(entity) {
    return new Promise((resolve, reject) => {
      return this.http.post(ENV.httpurlscm + createUri6, entity).subscribe(resp => {
        resolve(resp);
      }, error => {

      })
    })
  }
}
