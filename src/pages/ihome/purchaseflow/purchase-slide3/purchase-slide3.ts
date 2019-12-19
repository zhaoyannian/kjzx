import { Component } from '@angular/core';
import { NavController, NavParams, Events } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { ENV } from '@env/environment';
import { readUri, bizType, flowDefId, readUri3, bizType3, flowDefId3, readUri2, queryColumn, bizType2, flowDefId2, bizType4, readUri4, flowDefId4, readUri6, bizType6, flowDefId6 } from '../../../../icommon/provider/Constantscg';
import _ from 'lodash';
import 'rxjs/add/operator/timeout';
import { globalData } from '../../../../icommon/provider/globalData';
import { NativeService } from '../../../../icommon/provider/native';

/**
 * Generated class for the PurchaseSlide3Page page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-purchase-slide3',
  templateUrl: 'purchase-slide3.html',
})
export class PurchaseSlide3Page {

  //当前选择的分组按钮
  toggle = 'awiatData';
  //第几页
  page: any = 1;
  //一页多少条
  pageSize: any = 2;
  userinfor: any;
  allList: any = [];
  //总条数
  totalCount: number;
  flowType: any;
  queryKey: any;
  currUserId: any;
  status: any = '1';
  pageInfo: any;
  url: any;
  title: any;
  constructor(public globalData: globalData, public http: HttpClient, public nativeService: NativeService, public navCtrl: NavController, public navParams: NavParams, private events: Events, ) {
  }

  ngOnDestroy() {
    this.events.unsubscribe('purchase:complateData')
  }
  ngOnInit() {
    this.userinfor = JSON.parse(localStorage.getItem("objectList"));
    this.events.subscribe('purchase:complateData', (type, num, time) => {
      this.toggle = num;
      this.flowType = type;
      if (this.toggle == 'awiatData') {
        this.status = '1';
      } else if (this.toggle == 'dealData') {
        this.status = '2';
      } else {
        this.status = '4';
      }
      if (this.flowType == 1) {
        this.url = readUri;
        this.title = "仪器设备采购";
      } else if (this.flowType == 2) {
        this.url = readUri2;
        this.title = "仪器设备合同";
      } else if (this.flowType == 4) {
        this.url = readUri4;
        this.title = "元器件合同";
      } else if (this.flowType == 3) {
        this.url = readUri3;
        this.title = "元器件采购";
      } else if (this.flowType == 5) {
        this.url = readUri4;
        this.title = "正样元器件合同";
      } else if (this.flowType == 6) {
        this.url = readUri6;
        this.title = "项目委托申请";
      }
      this.queryKey = time;
      this.page = 1;
      this.loadOrderDataFn(this.queryKey, null, 'load')
    });
  }
  loadOrderDataFn(queryKey, refresher, load) {
    if (!!load) {
      this.nativeService.showLoading();
    }
    this.page = 1;
    if (this.flowType == 4) {
      this.pageInfo = { page: this.page, pageSize: this.pageSize, type: 'MC' };
    } else if (this.flowType == 5) {
      this.pageInfo = { page: this.page, pageSize: this.pageSize, type: 'MCQ' };
    } else {
      this.pageInfo = { page: this.page, pageSize: this.pageSize };
    }
    this.http.post(ENV.httpurlscm + this.url, this.getParams(), { params: this.pageInfo, observe: "response" }).timeout(9000).subscribe(data => {
      this.totalCount = Number(data.headers.get("count"));
      if (this.flowType == 1) {
        this.allList = this.toJsonResult4(data.body)
      } else if (this.flowType == 2) {
        this.allList = this.toJsonResult(data.body)
        console.log(this.allList)
      } else if (this.flowType == 4 || this.flowType == 3 || this.flowType == 5 || this.flowType == 6) {
        this.allList = this.toJsonResult4(data.body)
      }

      if (!!refresher) {
        refresher.complete();
      }
      this.nativeService.hideLoading();

    }, error => {
      if (!!refresher) {
        refresher.complete();
      }
      this.nativeService.hideLoading();
    })
  }
  getParams() {
    if (this.flowType == 1) {
      return {
        status: this.status,
        bizType: bizType,
        flowDefId: flowDefId,
        page: this.page,
        pageSize: this.pageSize,
        queryKey: this.queryKey || '',
        userID: this.userinfor.loginInfo.emailWork
      };
    } else if (this.flowType == 2) {
      return {
        status: this.status,
        bizType: bizType2,
        flowDefId: flowDefId2,
        page: this.page,
        queryColumn: queryColumn,
        pageSize: this.pageSize,
        queryKey: this.queryKey || '',
        userID: this.userinfor.loginInfo.emailWork
      };
    } else if (this.flowType == 4 || this.flowType == 5) {
      return {
        status: this.status,
        bizType: bizType4,
        flowDefId: flowDefId4,
        personalityFlowDefId: "",
        queryKey: this.queryKey || '',
        userID: this.userinfor.loginInfo.emailWork
      };
    } else if (this.flowType == 3) {
      return {
        status: this.status,
        bizType: bizType3,
        flowDefId: flowDefId3,
        page: this.page,
        pageSize: this.pageSize,
        queryKey: this.queryKey || '',
        userID: this.userinfor.loginInfo.emailWork
      };
    } else if (this.flowType == 6) {
      return {
        status: this.status,
        bizType: bizType6,
        flowDefId: flowDefId6,
        page: this.page,
        pageSize: this.pageSize,
        queryKey: this.queryKey || '',
        userID: this.userinfor.loginInfo.emailWork
      };
    }

  }
  //下拉分页查询
  tabslideNextRefreshFn(infiniteScroll) {
    if (this.totalCount == this.allList.length) {
      infiniteScroll.complete();
    } else {
      this.page += 1;
      let pageInfo = { page: this.page, pageSize: this.pageSize };
      let that = this;
      this.http.post(ENV.httpurlscm + this.url, this.getParams(), { params: pageInfo, observe: "response" }).timeout(9000).subscribe(data => {
        if (this.flowType == 1) {
          let list = this.toJsonResult4(data.body)
          this.allList = that.allList.concat(list);
        } else if (this.flowType == 2) {
          let list = this.toJsonResult(data.body)
          this.allList = that.allList.concat(list);

        } else if (this.flowType == 4 || this.flowType == 3 || this.flowType == 5 || this.flowType == 6) {
          let list = this.toJsonResult4(data.body)
          this.allList = that.allList.concat(list);
        }
        infiniteScroll.complete();

      }, error => {
        infiniteScroll.complete();
      })
    }
  }
  dealEntity(entry, bl) {
    if (this.flowType == 1) {
      this.navCtrl.push("PurchasefloweditorPage", { entry: entry, bl: bl, toggle: this.toggle, flowType: this.flowType });
    } else if (this.flowType == 2) {
      this.navCtrl.push("InstrumentPage", { entry: entry, bl: bl, toggle: this.toggle, flowType: this.flowType });
    } else if (this.flowType == 3) {
      this.navCtrl.push("CompopurappliPage", { entry: entry, bl: bl, toggle: this.toggle, flowType: this.flowType });
    } else if (this.flowType == 4) {
      this.navCtrl.push("ReagentsupplyPage", { entry: entry, bl: bl, toggle: this.toggle, flowType: this.flowType });
    } else if (this.flowType == 5) {
      this.navCtrl.push("ReagentsupplymasterPage", { entry: entry, bl: bl, toggle: this.toggle, flowType: this.flowType });
    } else if (this.flowType == 6) {
      this.navCtrl.push("EntrustApplyPage", { entry: entry, bl: bl, toggle: this.toggle, flowType: this.flowType });
    }

  }
  toJsonResult(resp) {
    var self = this;

    if (!!!resp.orgCodeName) {
      let arr = [];
      _.map(resp, n => {
        arr.push({ 'deptId': JSON.parse(n.title).orgCode });
      })
      this.http.post(ENV.httpurlscm + '/api/dml/queryByMultiConditions/com.stonewomb.common.entity.Dept', arr).subscribe(data => {
        console.log(data);
        _.map(resp, n => {
          _.map(data, m => {
            if (n.title.orgCode == m['deptId']) {
              n.title.orgCodeName = m['deptName']
            }
          })
        })
      })
    }
    if (!!!resp.applicantName) {
      let arr = [];
      _.map(resp, n => {
        arr.push({ 'userId': JSON.parse(n.title).applicant });
      })
      this.http.post(ENV.httpurlscm + '/api/dml/queryByMultiConditions/com.stonewomb.common.entity.Staff', arr).subscribe(data => {
        console.log(data);
        _.map(resp, n => {
          _.map(data, m => {
            if (n.title.applicant == m['userId']) {
              n.title.applicantName = m['userName']
            }
          })
        })
      })
    }
    var list = resp;
    let inputField = 'applicant';
    let valueFields = ['userName'];
    let destFields = ['applicantName'];
    let dictOpts = [{
      dict: 'SCM_APPLYORCONTRACT_TYPE',
      orgField: 'purchaseType',
      destField: 'purchaseTypeName'
    }];
    if (list.length > 0) {
      self.globalData.transformStaffEntity(inputField, valueFields, destFields, list, 'cgIp');
      self.globalData.transformDict(dictOpts, list, 'cgIp');
    }
    var entries = _.each(resp, (e) => {
      try {
        e.title = JSON.parse(e.title);
        self.transformEntryTitle([e.title]).then((list) => {
          e.title = list[0];
        });
      } catch (e) { }
    });
    return entries;
  }
  transformEntryTitle(data) {
    var self = this;
    let dictOpts = [{
      dict: 'SCM_APPLYORCONTRACT_TYPE',
      orgField: 'purchaseType',
      destField: 'purchaseTypeName'
    }];
    return self.globalData.transformDict(dictOpts, data, 'cgIp').then((list) => {
      return list;
    });

  }
  toJsonResult4(resp) {
    var self = this;
    var entries = _.each(resp, (e) => {
      try {
        e.title = JSON.parse(e.title);
        if (this.flowType == 4) {
          self.transformEntryTitle4([e.title]).then((list) => {
            e.title = list[0];
          });
        } else if (this.flowType == 3) {
          self.transformEntryTitle3([e.title]).then((list) => {
            e.title = list[0];
          });
        } else if (this.flowType == 5) {
          self.transformEntryTitle5(e.title);
        } else if (this.flowType == 1) {
          self.transformEntryTitle1([e.title]).then(list => {
            e.title = list[0];
          })
        } else if (this.flowType == 6) {
          self.transformEntryTitle6([e.title]).then(list => {
            e.title = list[0];
          })
        }

      } catch (e) {
        console.log(e)
      }
    });
    return entries;
  }
  transformEntryTitle6(d) {
    var self = this;
    if (!!!d.deptName) {
      let inputField2 = 'orgCode';
      let valueFields2 = ['deptName'];
      let destFields2 = ['deptName'];
      self.globalData.transformDeptEntity(inputField2, valueFields2, destFields2, d, 'cgIp');
    }

    let inputField = 'applicant';
    let valueFields = ['userName'];
    let destFields = ['userName'];
    self.globalData.transformStaffEntity(inputField, valueFields, destFields, d, 'cgIp');

    let dictOpts = [{
      dict: 'SCM_YQ_PROJECT',
      orgField: 'project',
      destField: 'projectName'
    }, {
      dict: 'SCM_WTPUR_WAY',
      orgField: 'purchaseWay',
      destField: 'purchaseWayName'
    }, {
      dict: 'SCM_TECHNOLOGY_AGREEMENT',
      orgField: 'isChange',
      destField: 'isChangeName'
    }];

    return self.globalData.transformDict(dictOpts, d, 'cgIp').then((list) => {
      return list;
    });
  }
  transformEntryTitle1(d) {
    var self = this;
    if (!!!d.deptName) {
      let clzName1 = 'com.stonewomb.common.entry.Organization';
      let inputField1 = 'orgCode';
      let indexedField1 = 'orgId';
      let valueFields1 = ['deptId'];
      let destFields1 = ['deptId'];
      self.globalData.transformEntity(clzName1, inputField1, indexedField1, valueFields1, destFields1, d, 'cgIp').then(
        (rd) => {
          if (rd['length'] > 0) {
            d = rd;
            let inputField2 = 'orgCode';
            let valueFields2 = ['deptName'];
            let destFields2 = ['deptName'];
            self.globalData.transformDeptEntity(inputField2, valueFields2, destFields2, d, 'cgIp');
          }
        }
      );
    }
    if (!!!d.userName) {
      let inputField = 'applicant';
      let valueFields = ['userName'];
      let destFields = ['userName'];
      self.globalData.transformStaffEntity(inputField, valueFields, destFields, d, 'cgIp');
    }

    let dictOpts = [{
      dict: 'SCM_APPLYORCONTRACT_TYPE',
      orgField: 'purchaseType',
      destField: 'purchaseTypeName'
    }];
    //填写人
    let inputFieldOne = 'fillPerson';
    let valueFieldsOne = ['userName'];
    let destFieldsOne = ['userFillName'];
    self.globalData.transformStaffEntity(inputFieldOne, valueFieldsOne, destFieldsOne, d, 'cgIp');
    return self.globalData.transformDict(dictOpts, d, 'cgIp').then((list) => {
      return list;
    });


  }
  transformEntryTitle5(d) {
    var self = this;
    let dictOpts = [{
      dict: 'SCM_APPLYORCONTRACT_TYPE',
      orgField: 'contractType',
      destField: 'contractTypeName'
    }, {
      dict: 'SCM_APPLYORCONTRACT_TYPE',
      orgField: 'technologyAgreement',
      destField: 'technologyAgreementName'
    }];
    self.globalData.transformDict(dictOpts, [d], 'cgIp');
    if (!!!d.orgCodeName) {
      let clzName1 = 'com.stonewomb.common.entry.Organization';
      let inputField1 = 'orgCode';
      let indexedField1 = 'orgId';
      let valueFields1 = ['deptId'];
      let destFields1 = ['deptId'];
      self.globalData.transformEntity(clzName1, inputField1, indexedField1, valueFields1, destFields1, [d], 'cgIp').then(
        (rd) => {
          if (rd['length'] > 0) {
            d = rd[0];
            let inputField2 = 'orgCode';
            let valueFields2 = ['deptName'];
            let destFields2 = ['orgCodeName'];
            self.globalData.transformDeptEntity(inputField2, valueFields2, destFields2, [d], 'cgIp');
          }
        }
      );
    }
    if (!!!d.applicantName) {
      let inputField = 'applicant';
      let valueFields = ['userName'];
      let destFields = ['applicantName'];
      self.globalData.transformStaffEntity(inputField, valueFields, destFields, [d], 'cgIp');
    }
  }
  transformEntryTitle3(data) {
    var self = this;
    if (!!!data.deptName) {
      let arr = [];
      _.map(data, n => {
        arr.push({ 'deptId': n.orgId });
      })
      this.http.post(ENV.httpurlscm + '/api/dml/queryByMultiConditions/com.stonewomb.common.entity.Dept', arr).subscribe(data2 => {
        _.map(data, n => {
          _.map(data2, m => {
            if (n.orgId == m['deptId']) {
              n.orgName = m['deptName'];
            }
          })
        })
      })
    }
    if (!!!data.userName) {
      let inputField = 'applicant';
      let valueFields = ['userName'];
      let destFields = ['userName'];
      self.globalData.transformStaffEntity(inputField, valueFields, destFields, data, 'cgIp');
    }
    let dictOpts = [{
      dict: 'SCM_APPLYORCONTRACT_TYPE',
      orgField: 'purchaseType',
      destField: 'purchaseTypeName'
    }, {
      dict: 'SCM_MATERIAL_TYPE',
      orgField: 'materialType',
      destField: 'materialTypeName'
    }];
    return self.globalData.transformDict(dictOpts, data, 'cgIp').then((list) => {
      //填写人
      let inputFieldOne = 'fillPerson';
      let valueFieldsOne = ['userName'];
      let destFieldsOne = ['userFillName'];
      return self.globalData.transformStaffEntity(inputFieldOne, valueFieldsOne, destFieldsOne, list, 'cgIp').then(d => {
        return d;
      });
    });

  }
  transformEntryTitle4(data) {
    var self = this;

    if (!!!data.orgCodeName) {
      let clzName1 = 'com.stonewomb.common.entry.Organization';
      let inputField1 = 'orgCode';
      let indexedField1 = 'orgId';
      let valueFields1 = ['deptId'];
      let destFields1 = ['deptId'];
      self.globalData.transformEntity(clzName1, inputField1, indexedField1, valueFields1, destFields1, data, 'cgIp').then(
        (rd) => {
          if (rd['length'] > 0) {
            data = rd;
            let inputField2 = 'orgCode';
            let valueFields2 = ['deptName'];
            let destFields2 = ['orgCodeName'];
            self.globalData.transformDeptEntity(inputField2, valueFields2, destFields2, data, 'cgIp');
          }
        }
      );
    }
    if (!!!data.applicantName) {
      let inputField = 'applicant';
      let valueFields = ['userName'];
      let destFields = ['applicantName'];
      self.globalData.transformStaffEntity(inputField, valueFields, destFields, data, 'cgIp');
    }
    let dictOpts = [{
      dict: 'SCM_APPLYORCONTRACT_TYPE',
      orgField: 'contractType',
      destField: 'contractTypeName'
    }, {
      dict: 'SCM_MATERIAL_TYPE',
      orgField: 'materiaType',
      destField: 'materialTypeName'
    }];
    return self.globalData.transformDict(dictOpts, data, 'cgIp').then((list) => {
      return list;
    });
  }

}
