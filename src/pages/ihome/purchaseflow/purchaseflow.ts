import { globalData } from './../../../icommon/provider/globalData';
import { NativeService } from './../../../icommon/provider/native';
import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides, Events, Searchbar} from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { ENV } from '@env/environment';
import { readUri, bizType, flowDefId, readUri3, bizType3, flowDefId3, readUri2, queryColumn, bizType2, flowDefId2, bizType4, readUri4, flowDefId4,readUri6 } from './../../../icommon/provider/Constantscg';
import _ from 'lodash';
import 'rxjs/add/operator/timeout';
declare var Swiper;
/**
 * Generated class for the PurchaseflowPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-purchaseflow',
  templateUrl: 'purchaseflow.html',
})
export class PurchaseflowPage {
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
  queryKey: any = '';
  currUserId: any;
  status: any = '1';
  pageInfo: any;
  url: any;
  title: any;
  swiper5: any;
  @ViewChild('contentSlides') contentSlides: Slides;
  menus: Array<string> = ["待处理", "已处理", "已办结"];
  isShow: boolean = true;
  @ViewChild('searchBar') searchBar: Searchbar;
  address:any;
  constructor(public globalData: globalData, public http: HttpClient, public nativeService: NativeService, public navCtrl: NavController, public navParams: NavParams, private events: Events, ) {
    this.flowType = this.navParams.get("flowType")
    this.userinfor = JSON.parse(localStorage.getItem("objectList"));
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
    } else if(this.flowType == 6){
      this.url = readUri6;
      this.title = "项目委托申请";
    }
    // self.status === '1' ? '待处理' : self.status === '2' ? '已处理' : self.status === '4' ? '已办结' : ''
  }
  goback() {
    this.navCtrl.pop();
  }
  initSwiper() {
    let that = this;
    that.swiper5 = new Swiper('.pageMenuSlides4 .swiper-container', {
      slidesPerView: 2,
      spaceBetween: 0,
      breakpoints: {
        1024: {
          slidesPerView: 3,
          spaceBetween: 0
        },
        768: {
          slidesPerView: 3,
          spaceBetween: 0
        },
        640: {
          slidesPerView: 3,
          spaceBetween: 0
        },
        320: {
          slidesPerView: 3,
          spaceBetween: 0
        }
      }
    });

  }
  selectPageMenu($event, index) {
    this.contentSlides.slideTo(index);
  }
  slideChanged() {
    let index = this.contentSlides.getActiveIndex();
    let that = this;

    that.setStyle(index);
    // that.swiper5.slideTo(index, 300);
  }

  setStyle(index) {
    var slides = document.getElementsByClassName('pageMenuSlides4')[0].getElementsByClassName('swiper-slide');
    if (index < slides.length) {
      for (var i = 0; i < slides.length; i++) {
        var s = slides[i];
        s.className = "swiper-slide";
      }
      slides[index].className = "swiper-slide bottomLine";
    }
    switch (index) {
      case 0:
        this.toggle = 'awiatData'
        this.events.publish('purchase:awiatData', this.flowType, 'awiatData', this.queryKey);
        break;
      case 1:
        this.toggle = 'dealData'
        this.events.publish('purchase:dealData', this.flowType, 'dealData', this.queryKey);
        break;
      case 2:
        this.toggle = 'complateData'
        this.events.publish('purchase:complateData', this.flowType, 'complateData', this.queryKey);
        break;
    }
  }
  ngOnDestroy() {
    this.events.unsubscribe('purchase:awiatData');
    this.events.unsubscribe('purchase:dealData');
    this.events.unsubscribe('purchase:complateData');

  }
  // ionViewDidLoad() {
  //   this.events.publish('purchase:awiatData', this.flowType, 'awiatData', this.queryKey);
  // }
  ionViewWillEnter() {
    this.initSwiper();
    this.isShow = true;
  }
  ionViewDidEnter() {
    var slides = document.getElementsByClassName('pageMenuSlides4')[0].getElementsByClassName('swiper-slide');
    for (var i = 0; i < slides.length; i++) {
      var s = slides[i];
      if (s.className.indexOf('bottomLine') > -1) {
        this.selectPageMenu(null,i);
        this.swiper5.params.initialSlide =i;
        if(this.swiper5.params.initialSlide ==0){
            this.setStyle(i);
        }
      }
    }
  }
  ionViewDidLeave() {
    this.swiper5.destroy(true, true)
  }
  toggleClick(event: any) {
    this.toggle = event;
    if (this.toggle == 'awiatData') {
      this.status = '1';
    } else if (this.toggle == 'dealData') {
      this.status = '2';
    } else {
      this.status = '4';
    }
    setTimeout(() => {
      this.loadOrderDataFn(this.queryKey, null, 'load')
    }, 200)
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
        // this.allList = data.body;
        // _.map(this.allList, n => {
        //   n.title = JSON.parse(n.title);
        // })
        this.allList = this.toJsonResult4(data.body)
      } else if (this.flowType == 2) {
        this.allList = this.toJsonResult(data.body)
        console.log(this.allList)
      } else if (this.flowType == 4 || this.flowType == 3 || this.flowType == 5) {
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
    }

  }
  //刷新
  tabslideRefreshFn(refresher) {
    this.loadOrderDataFn(this.queryKey, refresher, null)
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
          // _.map(data.body, n => {
          //   n['title'] = JSON.parse(n['title']);
          // })
          // that.allList = that.allList.concat(data.body);
          let list = this.toJsonResult4(data.body)
          this.allList = that.allList.concat(list);
        } else if (this.flowType == 2) {
          let list = this.toJsonResult(data.body)
          this.allList = that.allList.concat(list);

        } else if (this.flowType == 4 || this.flowType == 3 || this.flowType == 5) {
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
      this.navCtrl.push("PurchasefloweditorPage", { entry: entry, bl: bl, flowType: this.flowType });
    } else if (this.flowType == 2) {
      this.navCtrl.push("InstrumentPage", { entry: entry, bl: bl, flowType: this.flowType });
    } else if (this.flowType == 3) {
      this.navCtrl.push("CompopurappliPage", { entry: entry, bl: bl, flowType: this.flowType });
    } else if (this.flowType == 4) {
      this.navCtrl.push("ReagentsupplyPage", { entry: entry, bl: bl, flowType: this.flowType });
    } else if (this.flowType == 5) {
      this.navCtrl.push("ReagentsupplymasterPage", { entry: entry, bl: bl, flowType: this.flowType });
    }

  }
  ionViewWillLeave() {
    let that = this;
    that.isShow = false;
    this.events.unsubscribe('purchase:awiatData');
    this.events.unsubscribe('purchase:dealData');
    this.events.unsubscribe('purchase:complateData');
  }
  clear() {
    this.address = '';
    this.searchBar.value = ''
    this.queryKey = '';
    this.getItems();
  }
  inputchange() {
      if (this.address.trim() == '') {
          this.getItems();
      }
  }
  keyUpSearch(event) {
      if (event.keyCode == 13) {
          this.getItems();
      }
  }
  getItems() {
      // this.searchTextStream.next($event.target.value);
      let that = this;
      var val = this.address;
      if (val && val.trim() != '') {
          this.queryKey = val;
          this.page = 1;
          this.loadOrderDataFn(this.queryKey, null, 'load');
      } else {
          this.queryKey = '';
          this.page = 1;
          this.loadOrderDataFn(this.queryKey, null, 'load');
      }
      switch (this.toggle) {
        case 'awiatData':
          this.events.publish('purchase:awiatData', this.flowType, this.toggle, this.queryKey);
          break;
        case 'dealData':
          this.events.publish('purchase:dealData', this.flowType, this.toggle, this.queryKey);
          break;
        case 'complateData':
          this.events.publish('purchase:complateData', this.flowType, this.toggle, this.queryKey);
          break;
      }
  }
  // getItems = _.throttle(function (ev) {
  //   var val = ev.target.value;
  //   this.page = 1;
  //   if (val && val.trim() != '') {
  //     this.queryKey = val;
  //     this.loadOrderDataFn(this.queryKey, null, 'load')
  //   } else {
  //     this.queryKey = '';
  //     this.loadOrderDataFn(this.queryKey, null, 'load')
  //   }
  //   switch (this.toggle) {
  //     case 'awiatData':
  //       this.events.publish('purchase:awiatData', this.flowType, this.toggle, this.queryKey);
  //       break;
  //     case 'dealData':
  //       this.events.publish('purchase:dealData', this.flowType, this.toggle, this.queryKey);
  //       break;
  //     case 'complateData':
  //       this.events.publish('purchase:complateData', this.flowType, this.toggle, this.queryKey);
  //       break;
  //   }
  // }, 800);
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
      // let inputField = 'applicant';
      // let valueFields = ['userName'];
      // let destFields = ['applicantName'];
      // self.globalData.transformStaffEntity(inputField, valueFields, destFields, [resp], 'cgIp');
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
        }

      } catch (e) {
        console.log(e)
      }
    });
    return entries;
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
      // let clzName1 = 'com.stonewomb.common.entry.Organization';
      // let inputField1 = 'orgId';
      // let indexedField1 = 'orgId';
      // let valueFields1 = ['deptId'];
      // let destFields1 = ['deptId'];
      // self.globalData.transformEntity(clzName1, inputField1, indexedField1, valueFields1, destFields1, data, 'cgIp').then(
      //   (rd) => {
      //     if (rd['length'] > 0) {
      //       data = rd;
      //       let inputField2 = 'deptId';
      //       let valueFields2 = ['deptName'];
      //       let destFields2 = ['deptName'];
      //       self.globalData.transformDeptEntity(inputField2, valueFields2, destFields2, data, 'cgIp');
      //     }
      //   }
      // );
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
