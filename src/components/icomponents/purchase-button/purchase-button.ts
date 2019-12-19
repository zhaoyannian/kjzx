import { globalData } from './../../../icommon/provider/globalData';
import { NativeService } from './../../../icommon/provider/native';
import { Component, Input } from '@angular/core';
import { NavController, NavParams, AlertController, ModalController } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import * as $ from 'jquery';
import { HttpClient } from '@angular/common/http';
import { ENV } from '@env/environment';
import _ from 'lodash';
import { Keyboard } from '@ionic-native/keyboard';
import {
  readSubUri, payReadUri, deliveryReadUri, getAmountConfigUri, getAmountConfigUri3, getMaxCodeUri4, getMaxCodeUri3, getMaxCodeUri, createUri, createUri3, readButtonUri, canSkipFlowPointZHB, canSkipFlowPoint, autoHandlePoint,
  flowDefId6, getMaxCodeUri6, createUri6
} from './../../../icommon/provider/Constantscg';
import { Events } from 'ionic-angular';
@Component({
  selector: 'purchase-button',
  templateUrl: 'purchase-button.html'
})
export class PurchaseButtonComponent {
  myForm: FormGroup;
  @Input() OPINION_TITLE;
  @Input() buttons;
  @Input() editingEntry;
  @Input() currAmounts;
  @Input() hjenty;
  @Input() currentPoint;
  @Input() points;
  @Input() flowType;
  @Input() editable;
  @Input() lockfileds;
  @Input() point;
  @Input() toggle;
  // @Input() draftsUserName;
  // @Input() lastPoint;
  lastPoint: any;
  // point: any = {};
  dataInformations: any = [];
  totalAll: any;
  maxTotalAll: any;
  collspaed: boolean = true;
  httpurl: any;
  userinfor: any = {};
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
  opinionList: any = [];
  _bizParams: any;
  len: any;
  firstPoint: any;
  nextPoint: any;
  nexthandleUser: any;
  ignoredPoint: any;
  specialDept: any;
  selectPatrIn: any;
  partInUserId: any;
  dataUrl: any;
  testRe: any;
  caCode: any;
  isButton: any;
  deliveryReadUri: any;
  payReadUri: any;
  readSubUri: any;
  btnScroll: boolean = false;
  btnscollHeight: any;
  datascroll: any = {}
  ismobile: boolean = false;
  url: any;
  constructor(private events: Events, private keyboard: Keyboard, public modalCtrl: ModalController, public globalData: globalData, public NativeService: NativeService, public fb: FormBuilder, public http: HttpClient, private alerCtrl: AlertController, public navCtrl: NavController, public navParams: NavParams) {
    this.myForm = this.fb.group({
      opinion: ['', [Validators.required]],
    });
    this.userinfor = JSON.parse(localStorage.getItem("objectList"));

    this.events.subscribe('btnscroll', content => {
      console.log(content)
      let that = this;
      if (!content.btnscroll) {
        that.datascroll.btnscroll = false;
        that.datascroll.btnscollHeight = 0
      }
    }, error => {
      let that = this;
      that.datascroll.btnscroll = false;
      that.datascroll.btnscollHeight = 0
    });
    if (this.NativeService.isAndroid()) {
      this.ismobile = true;
    }
  }
  // 自定义按钮的提交
  manage = _.throttle(function (btn, opinionTitle) {
    if (this.publicManage(this.editingEntry, true)) {
      this.NativeService.showLoading();
      if (this.flowType == 1 || this.flowType == 3) {
        // console.log(this.editingEntry.bizEntity.draftingDeptName);
        if (this.flowType == 1) {
          this.url = createUri;
        } else {
          this.url = createUri3;
        }
        if (this.editingEntry.bizEntity.draftingDept == 'cgb') {
          this.editingEntry.bizEntity.contractDraftingStaff = "";
          this.draftsUserName = "";
          //保存业务数据
          this.http.post(ENV.httpurlscm + this.url, this.editingEntry.bizEntity).subscribe(async resp => {
            await this.flow(btn, opinionTitle)
            return true;
          }, error => {
            return false;
          })
        } else {
          this.http.post(ENV.httpurlscm + this.url, this.editingEntry.bizEntity).subscribe(async resp => {
            await this.flow(btn, opinionTitle);
            return true;
          }, error => {
            return false;
          })
        }
      } else if (this.flowType == 6) {
        this.url = createUri6;
        this.http.post(ENV.httpurlscm + this.url, this.editingEntry.bizEntity).subscribe(async resp => {
          await this.flow(btn, opinionTitle);
          return true;
        }, error => {
          return false;
        })
      } else {
        this.flow(btn, opinionTitle);
      }

    }
  }, 800);

  flow(btn, opinionTitle) {
    var self = this;
    let entryParam = self.combParam(btn.param, opinionTitle);
    this.NativeService.showLoading();
    delete this.editingEntry.bizEntity.userName;
    delete this.editingEntry.bizEntity.deptName;
    if (btn.type === 'DELEGATION') {
      // 如果是转发类型的按钮
      //if (self.currentPoint.POPWINDOW === '1') {
      // 公用的选人弹框，转发要机构选人，不用btn里的参数
      self.selectPartIn(btn, entryParam, self.currentPoint);
    } else if (btn.type === 'SUBMIT') { // 如果是提交类型的按钮，判断当前环节是否是最后一个环节
      if (self.isLastPoint(self.currentPoint)) { // 是最后一个环节
        this.NativeService.hideLoading();
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
      if (btn.type === 'ROLEBACK' && self.isFirstPoint(self.currentPoint)) {
        this.NativeService.hideLoading(); // 如果是退回按钮，是第一个环节不能退回
        self.NativeService.showAlert('第一个环节不能【退回】！');
      }
      if (btn.type === 'ROLEBACK' && self.OPINION_TITLE === '同意') { // 如果是退回按钮，是第一个环节不能退回
        self.OPINION_TITLE = '';
        this.NativeService.hideLoading();
        self.NativeService.showAlert('请填写办理意见！');
      } else { // 直接发送请求
        if (btn.type === 'ROLEBACK') {
          this.NativeService.hideLoading();
          this.alerCtrl.create({
            title: "确定退回吗？",
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
                  self.sendReq(btn, entryParam);
                }
              }
            ]
          }).present();
        } else {
          // TODO 如果是非'提交、退回、办结'按钮，暂时做同样处理
          self.sendReq(btn, entryParam);
        }

      }
    }
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
    this.NativeService.showLoading();
    if (!!tmpNextPoint && _.includes(autoHandlePoint.pointTitles, tmpNextPoint.TITLE)) {
      // if (true) {
      self.getButton(self.currentPoint.POINTID).then(btns => {
        var submitBtn = _.find(btns, (n) => n['type'] === "SUBMIT");
        if (!submitBtn) {
          // entryParamPromise.resolve();
          this.btnRequest(btn, entryParam);
          return;
        }
        var posUrl = submitBtn['actorUri'] + '/' + tmpNextPoint.POINTID;
        var params = Object.assign({}, () => _.zipObject(_.map(submitBtn['actorParams'], 'key'), _.map(submitBtn['actorParams'], 'value')) || {}, {
          bizdata: self.hjenty
        });
        return new Promise((resolve, reject) => {
          return self.http.post(ENV.httpurlscm + posUrl, params)
            .timeout(9000).subscribe(resp => {
              resolve(resp);
              console.log(resp)
            }, error => {
              reject(error)
              this.NativeService.hideLoading();
            })
        })
      }).then((users) => {
        if (!!users && users['length'] > 0) {
          console.log("point1:" + self.nexthandleUser);
        }
        //next2环节
        let tmpNext2Point = _.find(self.points, (n) => n.SEQ === self.currentPoint.SEQ + 2);
        if (!!tmpNext2Point && _.includes(autoHandlePoint.pointTitles, tmpNext2Point.TITLE)) {
          self.getButton(tmpNextPoint.POINTID).then((btns) => {
            var submitBtn = _.find(btns, (n) => n['type'] === "SUBMIT");
            if (!submitBtn) {
              // entryParamPromise.resolve();
              this.btnRequest(btn, entryParam);
              return;
            }
            var posUrl = submitBtn['actorUri'] + '/' + tmpNext2Point.POINTID;
            var params = Object.assign({}, () => _.zipObject(_.map(submitBtn['actorParams'], 'key'), _.map(submitBtn['actorParams'], 'value')) || {}, {
              bizdata: self.hjenty
            });
            return new Promise((resolve, reject) => {
              return self.http.post(ENV.httpurlscm + posUrl, params)
                .timeout(9000).subscribe(resp => {
                  resolve(resp);
                  console.log(resp)
                }, error => {
                  reject(error)
                  this.NativeService.hideLoading();
                })
            })
          }).then((users) => {
            if (!!users && users['length'] > 0) {
              console.log("point2:" + users[0].userId);
              if (_.isEqual(self.nexthandleUser, users[0].userId)) {
                entryParam.autoHandlePointIds.push(tmpNext2Point.POINTID);
                //next3环节
                let tmpNext3Point = _.find(self.points, (n) => n.SEQ === self.currentPoint.SEQ + 3);
                if (!!tmpNext3Point && _.includes(autoHandlePoint.pointTitles, tmpNext3Point.TITLE)) {
                  self.getButton(tmpNext2Point.POINTID).then((btns) => {
                    var submitBtn = _.find(btns, (n) => n['type'] === "SUBMIT");
                    if (!submitBtn) {
                      // entryParamPromise.resolve();
                      this.btnRequest(btn, entryParam);
                      return;
                    }
                    var posUrl = submitBtn['actorUri'] + '/' + tmpNext3Point.POINTID;
                    var params = Object.assign({}, () => _.zipObject(_.map(submitBtn['actorParams'], 'key'), _.map(submitBtn['actorParams'], 'value')) || {}, {
                      bizdata: self.hjenty
                    });
                    return new Promise((resolve, reject) => {
                      return self.http.post(ENV.httpurlscm + posUrl, params)
                        .timeout(9000).subscribe(resp => {
                          resolve(resp);
                          console.log(resp)
                        }, error => {
                          reject(error)
                          this.NativeService.hideLoading();
                        })
                    })
                  }).then((users) => {
                    if (!!users && users['length'] > 0) {
                      console.log("point3:" + users[0].userId);
                      if (_.isEqual(self.nexthandleUser, users[0].userId)) {
                        entryParam.autoHandlePointIds.push(tmpNext3Point.POINTID);
                        // entryParamPromise.resolve();
                        this.btnRequest(btn, entryParam);
                      } else {
                        // entryParamPromise.resolve();
                        this.btnRequest(btn, entryParam);
                      }
                    }
                  });
                } else {
                  // entryParamPromise.resolve();
                  this.btnRequest(btn, entryParam);
                }
              } else {
                // entryParamPromise.resolve();
                this.btnRequest(btn, entryParam);
              }
            }
          });
        } else {
          // entryParamPromise.resolve();
          this.btnRequest(btn, entryParam);
        }
      });
    } else {
      // entryParamPromise.resolve();
      this.btnRequest(btn, entryParam);
    }
    // $.when([entryParamPromise.promise]).then(() => {
    //   self.http.post(ENV.httpurlscm + btn.api, entryParam).subscribe(resp => {
    //     if (resp) {
    //       this.navCtrl.pop();
    //     }
    //   }, error => console.log(error))
    // });
  }
  btnRequest(btn, entryParam) {
    this.http.post(ENV.httpurlscm + btn.api, entryParam).timeout(9000).subscribe(resp => {
      if (resp) {
        switch (this.toggle) {
          case 'awiatData':
            this.events.publish('purchase:awiatData', this.flowType, this.toggle, '');
            break;
          case 'dealData':
            this.events.publish('purchase:dealData', this.flowType, this.toggle, '');
            break;
          case 'complateData':
            this.events.publish('purchase:complateData', this.flowType, this.toggle, '');
            break;
        }
        this.NativeService.hideLoading();
        this.navCtrl.pop();
      }
    }, error => { this.NativeService.hideLoading(); })
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
  //公共验证提交方法  -- 验证是否是草稿 -- 没有flowDefId说明是业务草稿
  publicManage(entry, type) {
    var self = this;
    if (this.flowType == 5) {
      entry.bizEntity.type = "MCQ";
    }
    if (!self.publicGetAmount(entry) && this.flowType != 6) {
      //验证未通过
      if (!!!self.currAmounts.maxAmount) {
        let msg;
        if (this.flowType == 5) {
          msg = "合同总额必须大于" + self.currAmounts.minAmount + "元";
        } else {
          msg = "预测总额必须大于" + self.currAmounts.minAmount + "元";
        }
        this.NativeService.showAlert(msg);
        return false;
      } else {
        let msg;
        if (this.flowType == 5) {
          msg = "合同总额必须在" + self.currAmounts.minAmount + "元 ~ " + self.currAmounts.maxAmount + '元内！';
        } else {
          msg = "预测总额必须在" + self.currAmounts.minAmount + "元 ~ " + self.currAmounts.maxAmount + '元内！';
        }
        this.NativeService.showAlert(msg);
        return false;
      }
    } else {
      var internalFun = () => {
        if (type && !entry.flowSaveParDto.flowDefId) {
          if (this.flowType == 1 || this.flowType == 3) {
            self.checkAmount(entry.bizEntity.amount).then((flowDefId) => {
              if (type && flowDefId == "0") {
                this.NativeService.showAlert("请输入正确的预测总额！");
                return false;
              }
              entry.flowSaveParDto.flowDefId = flowDefId;
              pulicGetCode(entry, type);
            });
          } else if (this.flowType == 2 || this.flowType == 4) {
            self.checkAmount(entry.bizEntity.contractPrice).then((flowDefId) => {
              if (type && flowDefId == "0") {
                this.NativeService.showAlert("请输入正确的预测总额！");
                return false;
              }
              entry.flowSaveParDto.flowDefId = flowDefId;
              pulicGetCode(entry, type);
            });
          } else if (this.flowType == 5) {
            self.checkAmount2(entry.bizEntity.contractPrice, 'cgb').then((flowDefId) => {
              if (type && flowDefId == "0") {
                this.NativeService.showAlert("当前合同金额无法匹配到相对应的流程！");
                return false;
              }
              entry.flowSaveParDto.flowDefId = flowDefId;
              pulicGetCode(entry, type);
            });
          } else if (this.flowType == 6) {
            entry.flowSaveParDto.flowDefId = flowDefId6;
            pulicGetCode(entry, type);
          }

        } else {
          if (type && !!entry.flowSaveParDto.flowDefId) {
            if(this.flowType == 1){
              if(type && entry.flowSaveParDto.flowInstName ==='申请部门主任'){
                  entry.bizEntity.applyDeptUserId = this.userinfor.staff.userId;
              }
              if(type && entry.flowSaveParDto.flowInstName==='主管部门经办人'){
                  entry.bizEntity.competentDeptUserID=entry.bizEntity.competentDeptUserID || this.userinfor.staff.userId;
              }
              if(type && entry.flowSaveParDto.flowInstName==='主管部门负责人'){
                  entry.bizEntity.businessUserId = this.userinfor.staff.userId;
              }
              if(type && entry.flowSaveParDto.flowInstName==='采购经办人'){
                  entry.bizEntity.operatorUserId =this.userinfor.staff.userId;
              }

              if(type && entry.flowSaveParDto.flowInstName==='采购主任'){
                  entry.bizEntity.manageUserId=this.userinfor.staff.userId;
              }
              if(type && entry.flowSaveParDto.flowInstName==='分管业务中心所领导'){
                  entry.bizEntity.chargeBusinessUserID = entry.bizEntity.chargeBusinessUserID || this.userinfor.staff.userId;
              }
              if(type && entry.flowSaveParDto.flowInstName==='分管财务中心所领导'){
                  entry.bizEntity.chargeFinanceUserID=this.userinfor.staff.userId;
              }
            }
            if (this.flowType == 6) {
              //需求部门负责人
              if (!!self.point && self.point.sequence === 2) {
                entry.bizEntity.demandUserId = this.userinfor.staff.userId;
              }
              //业务主管部门负责人
              if (!!self.point && self.point.sequence === 4) {
                entry.bizEntity.businessUserId = this.userinfor.staff.userId;
              }
              //保存采购办负责人信息
              if (!!self.point && self.point.sequence === 5) {
                entry.bizEntity.manageUserId = this.userinfor.staff.userId;
              }
              //保存采购办经办人
              if (!!self.point && self.point.sequence === 7) {
                entry.bizEntity.operatorUserId = this.userinfor.staff.userId;
              }
            }
          }
          pulicGetCode(entry, type);
        }
      };
      //--- 验证是否需要获取最新编号
      var pulicGetCode = (entry, type) => {
        var self = this;
        if (this.flowType == 1) {
          if (!!!entry.bizEntity.detail.paCode) {
            self.getCode(getMaxCodeUri).then(data => {
              entry.bizEntity.detail.paCode = data['code'];
              self.editingEntry.bizEntity.detail.paCode = data['code'];
              publicForward(entry, type);
            });
          } else {
            publicForward(entry, type);
          }
        } else if (this.flowType == 2) {
          let deptType = entry.bizEntity.operateDepartment === 'bmzx' ? 'Y' : (entry.bizEntity.operateDepartment === 'cgb' ? 'C' : '');
          let purType = entry.bizEntity.contractType === 'outer' ? 'W' : (entry.bizEntity.contractType === 'within' ? 'N' : '');
          let prefix = deptType + 'S' + purType;
          if (!!!entry.bizEntity.caCode) {
            self.getCode(getMaxCodeUri).then((data) => {
              entry.bizEntity.caCode = data['caCode'];
              publicForward(entry, type);
            });
          } else {
            publicForward(entry, type);
          }
        } else if (this.flowType == 3) {
          if (!!!entry.bizEntity.paCode) {
            self.getCode(getMaxCodeUri3).then((data) => {
              entry.bizEntity.detail.paCode = data['code'];
              self.editingEntry.bizEntity.detail.paCode = data['code'];
              publicForward(entry, type);
            });
          } else {
            publicForward(entry, type);
          }
        } else if (this.flowType == 5) {
          // let deptType = 'C';
          // let prefix = deptType + 'Z' + 'Y';
          if (!!!entry.bizEntity.caCode) {
            self.getCode(getMaxCodeUri3).then((data) => {
              entry.bizEntity.caCode = data['code'];
              entry.bizEntity.paCode = data['code'];
              publicForward(entry, type);
            });
          } else {
            publicForward(entry, type);
          }
        } else if (this.flowType == 4) {
          let deptType = entry.bizEntity.operateDepartment === 'bmzx' ? 'Y' : (entry.bizEntity.operateDepartment === 'cgb' ? 'C' : '');
          let purType = entry.bizEntity.contractType === 'outer' ? 'W' : (entry.bizEntity.contractType === 'within' ? 'N' : '');
          let prefix = deptType + 'S' + purType;
          if (!!!entry.bizEntity.caCode) {
            self.getCode(getMaxCodeUri4 + '/' + prefix).then((data) => {
              entry.bizEntity.caCode = data['caCode'];
              publicForward(entry, type);
            });
          } else {
            publicForward(entry, type);
          }
        } else if (this.flowType == 6) {
          if (!!!entry.bizEntity.paCode) {
            self.getCode(getMaxCodeUri6).then((data) => {
              entry.bizEntity.paCode = data['code'];
              publicForward(entry, type);
            });
          } else {
            publicForward(entry, type);
          }
        }

      }
      //验证需要进行的跳转操作
      var publicForward = (data, type) => {
        var self = this;
        if (type) {
          if (this.flowType == 1) {
            if (data.bizEntity.subjectFunding !== data.bizEntity.amount) {
              this.NativeService.showAlert("课题资金和预测总额不一致！");
              return false;
            }


            // this.editingEntry.bizEntity.draftingDeptName 
          }
          // self.complex(data);
        } else {
          cre(data.bizEntity);
        }
      }
      var cre = (entry) => {
        var self = this;
        let url;
        if (this.flowType == 3) {
          url = createUri3
        } else if (this.flowType == 1 || this.flowType == 2) {
          url = createUri
        }
        return self.http.post(ENV.httpurlscm + url, entry, {}).subscribe(resp => {
          if (resp && resp !== null) {
            self.editingEntry.bizEntity = resp;
            if (this.flowType == 1) {
              self.transformEntry(self.editingEntry.bizEntity);
            } else if (this.flowType == 2) {
              self.transformEntry2(self.editingEntry);
            } else if (this.flowType == 3) {
              self.transformEntry3(self.editingEntry.bizEntity);
            }

            this.NativeService.showAlert("暂存成功")
          }

        });
      }
      if (this.flowType == 1) {
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
      } if (this.flowType == 3) {
        // 草稿并且没选主管部门项目管理员时选人
        if (entry.bizEntity.subjectFunding > 0 && !self.point && !entry.bizEntity.competentDeptUserID) {
          this.NativeService.showAlert("请选择主管部门经办人！");
          return false;
        } else if (entry.bizEntity.subjectFunding > 100000 && !!self.point && self.point.sequence === 4 && !entry.bizEntity.chargeBusinessUserID) {
          // 当环节entity不为空、环节等于3并且分管业务中心所领导为空的时候
          this.NativeService.showAlert("请选择分管业务中心所领导！");
          return false;
        } else if (self.editable && !(self.lockfileds.indexOf('purchaseType') >= 0 || !!!self.point || self.point.sequence === 2) && !self.editingEntry.bizEntity.purchaseTypeName) {
          this.NativeService.showAlert("请选择采购类型！");
          return false;
        } else if (self.editable && !(self.lockfileds.indexOf('purchaseType') >= 0 || !!!self.point || self.point.sequence === 2) && !self.editingEntry.bizEntity.draftingDeptName) {
          this.NativeService.showAlert("请选择合同起草部门！");
          return false;
        } else if (self.editable && self.lockfileds.indexOf('purchaseWay') < 0 && !self.editingEntry.bizEntity.purchaseWayName) {
          this.NativeService.showAlert("请选择建议采购方式！");
          return false;
        }
        else {
          internalFun();
        }
      } else if (this.flowType == 5) {
        // (this.point.sequence == 3 && this.editable) && ((!!entry.bizEntity.chargeBusinessUserID )||(entry.bizEntity.contractPrice > 100000 &&!!entry.flowSaveParDto.flowInstName && this.editingEntry.flowSaveParDto.flowInstName == '主管部门经办人'))
        if (entry.bizEntity.contractPrice > 100000 && this.point.sequence == 3 && !entry.bizEntity.chargeBusinessUserID) {
          // 当环节entity不为空、环节等于3并且分管业务中心所领导为空的时候
          this.NativeService.showAlert("请选择分管业务中心所领导！");
          return false;
        } else {
          internalFun();
        }
      } else if (this.flowType == 2 || this.flowType == 4) {
        internalFun();
      } else if (this.flowType == 6) {
        if (!!self.point && self.point.sequence === 3 && !entry.bizEntity.chargeBusinessUserID) {
          // 当环节entity不为空、环节等于3并且分管业务中心所领导为空的时候
          this.NativeService.showAlert('请选择主管所领导');
          return false;
        }
        //  else if (!!self.point && self.point.sequence === 3 && (!entry.fileRwlist || entry.fileRwlist < 1)) {
        //   this.NativeService.showAlert("请上传任务书关键页。");
        //   return false;
        // }
         else if (!!self.point && self.point.sequence === 5 && !entry.bizEntity.purchaseWay) {
          this.NativeService.showAlert("请选择建议采购方式 。");
          return false;
        } else {
          internalFun();
        }
      }

    }
    return true;
  }
  transformEntry2(entry) {
    var self = this;
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
        self.editingEntry.bizEntity = data['length'] > 0 ? data[0] : {};
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
  }
  // 实体翻译
  transformEntry3(entry) {
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
      });
    }

    let clzName1 = 'com.stonewomb.common.entity.Organization';
    let inputField1 = 'orgId';
    let indexedField1 = 'orgId';
    let valueFields1 = ['deptId'];
    let destFields1 = ['deptId'];

    self.globalData.transformEntity(clzName1, inputField1, indexedField1, valueFields1, destFields1, [self.editingEntry.bizEntity], 'cgIp').then(
      (data) => {
        self.editingEntry.bizEntity = data['length'] > 0 ? data[0] : {};
        let inputField2 = 'deptId';
        let valueFields2 = ['deptName'];
        let destFields2 = ['orgName'];
        self.globalData.transformDeptEntity(inputField2, valueFields2, destFields2, [self.editingEntry.bizEntity], 'cgIp');
      }
    );
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
        self.editingEntry.bizEntity = data['length'] > 0 ? data[0] : {};
        let inputField2 = 'deptId';
        let valueFields2 = ['deptName'];
        let destFields2 = ['deptName'];
        self.globalData.transformDeptEntity(inputField2, valueFields2, destFields2, [self.editingEntry.bizEntity], 'cgIp');
      }
    );
  }
  //获取编号
  getCode(url) {
    return new Promise((resolve, reject) => {
      return this.http.post(ENV.httpurlscm + url, {}).subscribe(resp => {
        resolve(resp);
      }, error => {
        reject();
      }) // 出错，返回空对象);
    })
  }
  //验证金额段
  checkAmount2(amount, type) {
    var self = this;
    return new Promise((resolve, reject) => {
      return self.http.post(ENV.httpurlscm + getAmountConfigUri, {}).subscribe(async resp => {
        var amounts = resp;
        let data;
        if (Number(amount) <= amounts['firstAmount']) {
          // 金额小于等于5万
          data = type === 'bmzx' ? "c6fb53c8959e432fab90f54299e8ba11" : (type === 'cgb' ? 'b766acaabb354750bb1c8b55840b5416' : '0');
          await resolve(data);
        } else if (Number(amount) > amounts['firstAmount'] && Number(amount) <= amounts['secondAmount']) {
          // 大于5 小于等于10
          data = type === 'bmzx' ? "c6fb53c8959e432fab90f54299e8ba15" : (type === 'cgb' ? '111e37d52236495ead39f611e7560717' : '0');
          await resolve(data);
        } else if (Number(amount) > amounts['secondAmount'] && Number(amount) <= amounts['thirdAmount']) {
          // 大于10 小于等于100
          data = type === 'bmzx' ? "c6fb53c8959e432fab90f54299e8ba14" : (type === 'cgb' ? '92f5ecec10134caeb48032e9fe20df18' : '0');
          await resolve(data);
        } else if (Number(amount) > amounts['thirdAmount'] && Number(amount) <= amounts['fourthAmount']) {
          // 大于100 小于等于500
          data = type === 'bmzx' ? "c6fb53c8959e432fab90f54299e8ba13" : (type === 'cgb' ? 'd2704da8be474f90a77b22a5dbfcd019' : '0');
          await resolve(data);
        } else if (Number(amount) > amounts['fourthAmount']) {
          // 大于500万
          data = type === 'bmzx' ? "c6fb53c8959e432fab90f54299e8ba12" : (type === 'cgb' ? 'ea3f35356cd34aff9e27d67363849a20' : '0');
          await resolve(data);
        }

      }, error => {
        reject(error);
      });
    })
  }
  //验证金额段
  checkAmount(amount) {
    var self = this;
    return new Promise((resolve, reject) => {
      let url;
      if (this.flowType == 3) {
        url = getAmountConfigUri3
      } else if (this.flowType == 1 || this.flowType == 2 || this.flowType == 4) {
        url = getAmountConfigUri
      }
      return self.http.post(ENV.httpurlscm + url, {}).subscribe(async resp => {
        var amounts = {};
        amount = Math.floor(amount * 100) / 100;
        let data;
        if (Number(amount) <= amounts['firstAmount']) {
          data = "c6fb53c8959e432fab90f54299e8be8";
          await resolve(data);
        } else if (Number(amount) > amounts['firstAmount'] && Number(amount) <= amounts['secondAmount']) {
          data = "c6fb53c8959e432fab90f54299e8be8";
          await resolve(data);
        } else if (Number(amount) > amounts['secondAmount'] && Number(amount) <= amounts['thirdAmount']) {
          data = "c6fb53c8959e432fab90f54299e8bc6";
          await resolve(data);
        } else if (Number(amount) > amounts['thirdAmount'] && Number(amount) <= amounts['fourthAmount']) {
          data = "c6fb53c8959e432fab90f54299e8bd7";
          await resolve(data);
        } else if (Number(amount) > amounts['fourthAmount']) {
          data = "c6fb53c8959e432fab90f54299e8bb5";
          await resolve(data);
        }
        // await resolve(data);
        // return "0";
      }, error => {
        reject(error);
      });
    })

  }
  //--- 验证预测钱的正确性（在当前流程的范围内）
  publicGetAmount(entry) {
    var self = this;
    var amount
    if (this.flowType == 1 || this.flowType == 3) {
      amount = entry.bizEntity.amount;
    } else if (this.flowType == 2 || this.flowType == 5 || this.flowType == 4) {
      amount = entry.bizEntity.contractPrice;
    }
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
                  this.NativeService.hideLoading();
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
          // var defultEntityPromise = $.Deferred();
          // self.getUsers(btn, entryParam, point).then((data) => {
          //   if (!!_.isArray(data) && data.length > 0) {
          //     self.http.get(ENV.httpurlscm + '/api/staff/getStaffInfoByUserid/' + data[0]).subscribe(resp => {
          //       defultEntity = resp;
          //       defultEntityPromise.resolve();
          //     }, () => {
          //       defultEntityPromise.resolve();
          //     });
          //   } else {
          //     defultEntityPromise.resolve();
          //   }
          // }, () => {
          //   defultEntityPromise.resolve();
          // });
          // $.when([defultEntityPromise.promise]).then(() => {
          //   let readUri = btn.actorUri + '/' + point.POINTID;
          //   let bizdata = { bizdata: self.hjenty };
          //   let actorParams = _.zipObject(_.map(btn.actorParams, 'key'), _.map(btn.actorParams, 'value'));
          //   self.selectStaff(bizdata, actorParams, readUri, defultEntity, entryParam, btn);
          // });
          self.getUsers(btn, entryParam, point).then(data => {
            if (!!_.isArray(data) && data['length'] > 0) {
              self.http.get(ENV.httpurlscm + '/api/staff/getStaffInfoByUserid/' + data[0]).subscribe(async resp => {
                defultEntity = resp;
                let readUri = btn.actorUri + '/' + point.POINTID;
                let bizdata = { bizdata: self.hjenty };
                let actorParams = _.zipObject(_.map(btn.actorParams, 'key'), _.map(btn.actorParams, 'value'));
                await self.selectStaff(bizdata, actorParams, readUri, defultEntity, entryParam, btn);

              }, error => {
                self.getCom(btn, point, defultEntity, entryParam);
              });
            } else {
              self.getCom(btn, point, defultEntity, entryParam);
            }
          }, error => {
            self.getCom(btn, point, defultEntity, entryParam);
          })

        }

      });
    } else { }
  }
  getCom(btn, point, defultEntity, entryParam) {
    let readUri = btn.actorUri + '/' + point.POINTID;
    let bizdata = { bizdata: this.hjenty };
    let actorParams = _.zipObject(_.map(btn.actorParams, 'key'), _.map(btn.actorParams, 'value'));
    this.selectStaff(bizdata, actorParams, readUri, defultEntity, entryParam, btn);
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
  blurInput() {
    let that = this;
    that.datascroll.btnscroll = true;
    this.keyboard.onKeyboardShow().subscribe(data => {
      if (that.NativeService.isAndroid()) {
        //   that.datascroll.btnscroll = true;
        that.datascroll.btnscollHeight = data.keyboardHeight;
      }
    })
    if (that.datascroll.btnscollHeight > 0) {
    } else {
      that.datascroll.btnscollHeight = 267
    }
  }
  // blurInput() {
  //   let that = this;
  //   that.btnScroll = false;
  //   that.btnscollHeight = 0;
  // }
  focusInput() {
    let that = this;
    that.btnScroll = true;
    that.keyboard.onKeyboardShow().subscribe(data => {
      if (that.NativeService.isAndroid()) {
        that.btnScroll = true;
        that.btnscollHeight = data.keyboardHeight;
      }
    })
    if (that.btnscollHeight > 0) {
    } else {
      that.btnscollHeight = 267
    }
    // let that = this;
    // that.datascroll.btnscroll = true;
    // this.keyboard.onKeyboardShow().subscribe(data => {
    //   if (that.NativeService.isAndroid()) {
    //       that.datascroll.btnscroll = true;
    //     that.datascroll.btnscollHeight = data.keyboardHeight;
    //   }
    // })
    // if (that.datascroll.btnscollHeight > 0) {
    // } else {
    //   that.datascroll.btnscollHeight = 267
    // }
  }
}
