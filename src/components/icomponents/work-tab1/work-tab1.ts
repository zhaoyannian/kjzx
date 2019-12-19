import { Component, Input } from '@angular/core';
import { globalData } from './../../../icommon/provider/globalData';
import { NativeService } from './../../../icommon/provider/native';
import { NavController, NavParams, Events, ModalController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { ENV } from '@env/environment';
import { queryAllAliasUri, queryListUri, queryListUri2, queryListUri3, queryListUri4, queryAllAliasUri4, queryListUri5, queryListUri6, queryListUri7, queryListUri8, queryListUri9,queryListUri10, queryAllAliasUri3, sealSearchdb, icardSearchdb, networkSearchdb,netSearchdb,myNotifyUri } from './../../../icommon/provider/Constants';
import _ from 'lodash';
/**
 * Generated class for the WorkTab1Component component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'work-tab1',
  templateUrl: 'work-tab1.html'
})
export class WorkTab1Component {
  @Input() aliasMold;
  //第几页
  page: any = 1;
  //一页多少条
  pageSize: any = 10;
  userinfor: any;
  allList: any = [];
  wfInstStatuss: any;
  waitListUrl: any;
  dictOpts: any;
  //总条数
  totalCount: number = 0;
  toggle: any;
  queryKey: any = '';
  myNotifyUri:any;
  constructor(public globalData: globalData, public modalCtrl: ModalController,
    public nativeService: NativeService, public NavCtrl: NavController, public navParams: NavParams, public http: HttpClient, private events: Events, ) {
      this.myNotifyUri = myNotifyUri;

  }

  ngOnDestroy() {
    this.events.unsubscribe('tabs:awiatData')
  }


  ngOnInit() {
    this.events.subscribe('tabs:awiatData', (num, time) => {
      this.toggle = num;
      this.queryKey = time;
      this.page = 1;
      this.userinfor = JSON.parse(localStorage.getItem("objectList"));
      this.wfInstStatuss = { inprocess: '流转中', complate: '办结', terminal: '终止' };
      if (this.aliasMold == 'ProjectDaily') {
        this.waitListUrl = queryListUri;
        // 数据字典翻译
        this.dictOpts = [
          { dict: 'WY_BUSINESS_STATUS', orgField: 'procedureStatus', destField: 'procedureStatusName' }
        ];
        this.myNotifyUri = myNotifyUri;
      } else if (this.aliasMold.indexOf('SHIJIA') > -1 || this.aliasMold.indexOf('otherLeave3') > -1 || this.aliasMold.indexOf('Annual1') > -1) {
        this.http.post(ENV.httpurl + queryAllAliasUri, {}).subscribe(async result => {
          this.aliasMold = '';
          if (!!result) {
            _.map(result, (aliasTo) => {
              this.aliasMold += aliasTo['alias'] + ",";
            });
          }
        })
        this.myNotifyUri = myNotifyUri;
        this.waitListUrl = queryListUri2;
        // 数据字典翻译
        this.dictOpts = [
          { dict: 'DFKY_LEAVE_STATUS', orgField: 'procedureStatus', destField: 'procedureStatusName' }
        ];
      } else if (this.aliasMold.indexOf('SealApply') > -1) {  //印章申请
        this.http.post(ENV.httpurl + queryAllAliasUri3, {}).subscribe(async result => {
          this.aliasMold = '';
          if (!!result) {
            _.map(result, (aliasTo) => {
              this.aliasMold += aliasTo['alias'] + ",";
            });
          }
        });
        // this.allListUrl = queryListByPageUri3;
        this.waitListUrl = queryListUri3;
        if (this.queryKey.trim() != '') {
          this.myNotifyUri = sealSearchdb;
        } else {
          this.myNotifyUri = myNotifyUri;
        }

        // this.deleteListUrl = deleteUri3;
        // 数据字典翻译
        this.dictOpts = [
          { dict: 'WY_BUSINESS_STATUS', orgField: 'procedureStatus', destField: 'procedureStatusName' }
        ];
      } else if (this.aliasMold.indexOf('ICCard') > -1) {  //身份卡管理
        this.http.post(ENV.httpurl + queryAllAliasUri4, {}).subscribe(async result => {
          this.aliasMold = '';
          if (!!result) {
            _.map(result, (aliasTo) => {
              this.aliasMold += aliasTo['alias'] + ",";
            });
          }
        });
        this.waitListUrl = queryListUri4;
        if (this.queryKey.trim() != '') {
          this.myNotifyUri = icardSearchdb;
        } else {
          this.myNotifyUri = myNotifyUri;
        }
        // 数据字典翻译
        this.dictOpts = [
          { dict: 'WY_BUSINESS_STATUS', orgField: 'procedureStatus', destField: 'procedureStatusName' }
        ];
      } else if (this.aliasMold.indexOf('networkResource') > -1) {
        //网络资源管理
        this.waitListUrl = queryListUri5;
        if (this.queryKey.trim() != '') {
          this.myNotifyUri = networkSearchdb;
        } else {
          this.myNotifyUri = myNotifyUri;
        }
        this.aliasMold ='networkResource,networkResource2';
      
        // 数据字典翻译
        this.dictOpts = [
          { dict: 'WY_BUSINESS_STATUS', orgField: 'procedureStatus', destField: 'procedureStatusName' }
        ];
      }
      else if (this.aliasMold == 'webService') {
        //网络服务管理
        this.waitListUrl = queryListUri10;
        if (this.queryKey.trim() != '') {
          this.myNotifyUri = netSearchdb;
        } else {
          this.myNotifyUri = myNotifyUri;
        }
        // 数据字典翻译
        this.dictOpts = [
          { dict: 'WY_BUSINESS_STATUS', orgField: 'procedureStatus', destField: 'procedureStatusName' }
        ];
      }
       else if (this.aliasMold == 'goOutFlow') {  //外出报备
        this.waitListUrl = queryListUri6;
        // 数据字典翻译
        this.dictOpts = [
          { dict: 'WY_BUSINESS_STATUS', orgField: 'procedureStatus', destField: 'procedureStatusName' }
        ];
      } else if (this.aliasMold == 'ItemFile') {  //事项文件
        this.waitListUrl = queryListUri7;
        // 数据字典翻译
        this.dictOpts = [
          { dict: 'WY_BUSINESS_STATUS', orgField: 'procedureStatus', destField: 'procedureStatusName' }
        ];
      } else if (this.aliasMold == 'evection') {  //出差申请
        this.waitListUrl = queryListUri8;
        // 数据字典翻译
        this.dictOpts = [
          { dict: 'WY_BUSINESS_STATUS', orgField: 'procedureStatus', destField: 'procedureStatusName' }
        ];
      } else if (this.aliasMold == 'ReserveCarWF') {  //用车申请
        this.waitListUrl = queryListUri9;
        // 数据字典翻译
        this.dictOpts = [
          { dict: 'WY_BUSINESS_STATUS', orgField: 'procedureStatus', destField: 'procedureStatusName' }
        ];
      }
      this.loadOrderDataFn(null);
    });

    // this.loadOrderDataFn(null);
  }
  loadOrderDataFn(refresher) {
    this.nativeService.showLoading();
    let data = {
      appUserId: this.userinfor.staff.userId,
    }
    this.page = 1;
    let pageInfo = { page: 1, pageSize: this.pageSize,queryKey:this.queryKey };
    this.commonLoad(data, pageInfo, refresher, null);
  }
  commonLoad(data, pageInfo, refresher, infiniteScroll) {
    let that = this;
    that.getMyNotify(pageInfo, that.aliasMold, false, {}).then(result => {
      this.handleData(result, refresher, infiniteScroll)
    }, error => {
      this.nativeService.hideLoading();
    })
  }
  getMyNotify(pageInfo, wfAlias, isAllocated, filterParams) {
    let uri = this.myNotifyUri;
    if (wfAlias && this.queryKey.trim() == '') {
      uri += '/' + wfAlias;
      uri += '/' + isAllocated;
    }else{
      filterParams.workflowAlias= wfAlias;
      // filterParams.queryKey= wfAlias;
      // uri += '/' + wfAlias;
    }
    return new Promise((resolve, reject) => {
      return this.http.post(ENV.httpurl + uri, filterParams, { params: pageInfo }).subscribe(resp => {
        resolve(resp);
      }, error => {
        reject();
      }) // 出错，返回空对象);
    })
  }
  handleData(wfResp, refresher, infiniteScroll) {
    let that = this;
    this.totalCount = wfResp['count'];
    if (!!infiniteScroll) {
      this.allList = this.allList.concat(wfResp['data']);
    } else {
      this.allList = wfResp['data'];
    }
    that.globalData.transformDict(this.dictOpts, this.allList, 'oa');
    let keys = _.sortedUniq(_.map(this.allList, 'bizId')).filter(n => n); // 取出对应的id列表，去重、排除null
    this.http.post(ENV.httpurl + this.waitListUrl, keys).subscribe(async result => {
      this.nativeService.hideLoading();
      // this.totalCount = wfResp['count'];
      // if(!!infiniteScroll){
      //     this.allList = this.allList.concat(wfResp['data']);
      // }else{
      //     this.allList = wfResp['data'];
      // }
      // that.globalData.transformDict(this.dictOpts, this.allList);
      // 将查询到的业务数据合并到流程的数据bizData字段里
      _.map(this.allList, (n) => {
        if (n.workflowInstData) {
          n.bizData = _.find(result, {
            id: n.workflowInstData.bizId
          }); // 这里定义了业务数据放入bizData字段里
        }
      });
      if (!!refresher) {
        refresher.complete()
      }
      if (!!infiniteScroll) {
        infiniteScroll.complete()
      }

    }, error => {
      this.allList = [];
      if (!!refresher) {
        refresher.complete()
      }
      if (!!infiniteScroll) {
        infiniteScroll.complete()
      }
      this.nativeService.hideLoading();
    })
  }
  //刷新
  tabslideRefreshFn(refresher) {
    this.loadOrderDataFn(refresher)
  }
  //下拉分页查询
  tabslideNextRefreshFn(infiniteScroll) {
    if (this.totalCount == this.allList.length) {
      infiniteScroll.complete();
    } else {
      let data = {
        appUserId: this.userinfor.staff.userId,
      }
      this.page += 1;
      let pageInfo = { page: this.page, pageSize: this.pageSize };
      this.commonLoad(data, pageInfo, null, infiniteScroll)
    }
  }
  // 查看/处理(代办和已办)
  // 查看/处理(代办和已办)
  toEditor(entry, opeType) {
    if (this.aliasMold == 'ProjectDaily') {
      this.NavCtrl.push('EditPage', { entry: entry, id: entry.bizData.id, opeType: opeType, ref: entry.resourceInstId, wfAlias: entry.workflowAlias, toggle: this.toggle });
    } else if (this.aliasMold.indexOf('SHIJIA') > -1 || this.aliasMold.indexOf('otherLeave3') > -1 || this.aliasMold.indexOf('Annual1') > -1) {
      this.NavCtrl.push('VacationEditPage', { entry: entry, id: entry.bizData.id, opeType: opeType, ref: entry.resourceInstId, wfAlias: entry.workflowAlias, toggle: this.toggle });
    } else if (this.aliasMold.indexOf('SealApply') > -1) {  //印章申请
      this.NavCtrl.push('SealEditPage', { entry: entry, id: entry.bizData.id, opeType: opeType, ref: entry.resourceInstId, wfAlias: entry.workflowAlias, toggle: this.toggle });
    } else if (this.aliasMold.indexOf('ICCard') > -1) {   //身份卡管理
      this.NavCtrl.push('IccardEditPage', { entry: entry, id: entry.bizData.id, opeType: opeType, ref: entry.resourceInstId, wfAlias: entry.workflowAlias, toggle: this.toggle });
    } else if (this.aliasMold.indexOf('networkResource') > -1) {   //网络资源管理
      this.NavCtrl.push('NetworkEditPage', { entry: entry, id: entry.bizData.id, opeType: opeType, ref: entry.resourceInstId, wfAlias: entry.workflowAlias, toggle: this.toggle });
    } else if (this.aliasMold == 'goOutFlow') {   //网络资源管理
      this.NavCtrl.push('GooutEditorPage', { entry: entry, id: entry.bizData.id, opeType: opeType, ref: entry.resourceInstId, wfAlias: entry.workflowAlias, toggle: this.toggle });
    }else if (this.aliasMold == 'webService') {   //网络服务管理
      this.NavCtrl.push('ServiceEditPage', { entry: entry, id: entry.bizData.id, opeType: opeType, ref: entry.resourceInstId, wfAlias: entry.workflowAlias, toggle: this.toggle });
    } else if (this.aliasMold == 'goOutFlow') {   //网络服务管理
      this.NavCtrl.push('GooutEditorPage', { entry: entry, id: entry.bizData.id, opeType: opeType, ref: entry.resourceInstId, wfAlias: entry.workflowAlias, toggle: this.toggle });
    }
     else if (this.aliasMold == 'ItemFile') {  //事项文件
      this.NavCtrl.push('MattersEditPage', { entry: entry, id: entry.bizData.id, opeType: opeType, ref: entry.resourceInstId, wfAlias: entry.workflowAlias, toggle: this.toggle });
    } else if (this.aliasMold == 'evection') { //出差申请
      this.NavCtrl.push('EvectionEditorPage', { entry: entry, id: entry.bizData.id, opeType: opeType, ref: entry.resourceInstId, wfAlias: entry.workflowAlias, toggle: this.toggle });
    } else if (this.aliasMold == 'ReserveCarWF') {  //用车申请
      this.NavCtrl.push('UserCarEditPage', { entry: entry, id: entry.bizData.id, opeType: opeType, ref: entry.resourceInstId, wfAlias: entry.workflowAlias, toggle: this.toggle });
    }
  }
}
