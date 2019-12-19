import { Component, Input } from '@angular/core';
import { Helper } from '../../../icommon/provider/jpush';
import { globalData } from '../../../icommon/provider/globalData';
import { NativeService } from '../../../icommon/provider/native';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { WorkhoursEditPage } from '../../../pages/ihome/workhours/draft/editDraft';
import { HttpClient } from '@angular/common/http';
import { WorkhoursEditMxPage } from '../../../pages/ihome/workhours/draft/eidtDraftMx';
import { ProjectPage } from '../../../pages/ihome/workhours/project/project';
import { ENV } from '@env/environment';
import { queryAllAliasUri, queryListUri, queryListByPageUri, deleteUri, queryListByPageUri2, queryListUri2, deleteUri2, queryListByPageUri3, queryListUri3, deleteUri3, queryAllAliasUri3, queryListByPageUri4, queryListUri4, deleteUri4, queryAllAliasUri4, queryListByPageUri5, queryListUri5, deleteUri5, queryListByPageUri6, queryListUri6, deleteUri6, queryListByPageUri7, queryListUri7, deleteUri7, queryListByPageUri8, queryListUri8, deleteUri8, queryListByPageUri9, queryListUri9, deleteUri9,queryListByPageUri10,queryListUri10,deleteUri10 } from './../../../icommon/provider/Constants';
import _ from 'lodash';
@Component({
  selector: 'tab-slide',
  templateUrl: 'tab-slide.html'
})
export class TabSlideComponent {
  @Input() typeMold:Number;
  @Input() aliasMold:string;
  @Input() toggle:string;
  WorkhoursEditPage = WorkhoursEditPage;
  WorkhoursEditMxPage = WorkhoursEditMxPage;
  ProjectPage = ProjectPage;
  workHours: any = 'workHours';
  //当前选择的分组按钮
  // toggle = 'awiatData';
  //第几页
  page: any = 1;
  //一页多少条
  pageSize: any = 10;
  userinfor: any;
  allList: any = [];
  //总条数
  totalCount: number;
  wfInstStatuss: any;
  allListUrl: any;
  waitListUrl: any;
  deleteListUrl: any;
  dictOpts: any;
  constructor(public globalData: globalData, public helper: Helper,
    private alerCtrl: AlertController, public nativeService: NativeService, public NavCtrl: NavController, public navParams: NavParams, public http: HttpClient) {
    this.userinfor = JSON.parse(localStorage.getItem("objectList"));
    this.wfInstStatuss = { inprocess: '流转中', complate: '办结', terminal: '终止' };
    // this.typeMold = this.navParams.get("type");
    if (this.typeMold == 1) {
      this.toggle = 'AllData'
    } else {
      this.toggle = 'awiatData'
    }
    // this.aliasMold = this.navParams.get("alias");
    if (this.aliasMold == 'ProjectDaily') {
      this.allListUrl = queryListByPageUri;
      this.waitListUrl = queryListUri;
      this.deleteListUrl = deleteUri;
      // 数据字典翻译
      this.dictOpts = [
        { dict: 'WY_BUSINESS_STATUS', orgField: 'procedureStatus', destField: 'procedureStatusName' }
      ];
    } else if (this.aliasMold.indexOf('SHIJIA') > -1 || this.aliasMold.indexOf('otherLeave3') > -1 || this.aliasMold.indexOf('Annual1') > -1) {
      this.http.post(ENV.httpurl + queryAllAliasUri, {}).subscribe(async result => {
        this.aliasMold = '';
        if (!!result) {
          _.map(result, (aliasTo) => {
            this.aliasMold += aliasTo['alias'] + ",";
          });
        }
      })
      this.allListUrl = queryListByPageUri2;
      this.waitListUrl = queryListUri2;
      this.deleteListUrl = deleteUri2;
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
      this.allListUrl = queryListByPageUri3;
      this.waitListUrl = queryListUri3;
      this.deleteListUrl = deleteUri3;
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
      this.allListUrl = queryListByPageUri4;
      this.waitListUrl = queryListUri4;
      this.deleteListUrl = deleteUri4;
      // 数据字典翻译
      this.dictOpts = [
        { dict: 'WY_BUSINESS_STATUS', orgField: 'procedureStatus', destField: 'procedureStatusName' }
      ];
    } else if (this.aliasMold.indexOf('networkResource') > -1) {  //网络资源管理
      this.allListUrl = queryListByPageUri5;
      this.waitListUrl = queryListUri5;
      this.deleteListUrl = deleteUri5;
      this.aliasMold ='networkResource,networkResource2';
      // 数据字典翻译
      this.dictOpts = [
        { dict: 'WY_BUSINESS_STATUS', orgField: 'procedureStatus', destField: 'procedureStatusName' }
      ];
    }else if (this.aliasMold == 'webService') {  //网络服务管理
      this.allListUrl = queryListByPageUri10;
      this.waitListUrl = queryListUri10;
      this.deleteListUrl = deleteUri10;
      // 数据字典翻译
      this.dictOpts = [
        { dict: 'WY_BUSINESS_STATUS', orgField: 'procedureStatus', destField: 'procedureStatusName' }
      ];
    }
     else if (this.aliasMold == 'goOutFlow') {  //外出报备
      this.allListUrl = queryListByPageUri6;
      this.waitListUrl = queryListUri6;
      this.deleteListUrl = deleteUri6;
      // 数据字典翻译
      this.dictOpts = [
        { dict: 'WY_BUSINESS_STATUS', orgField: 'procedureStatus', destField: 'procedureStatusName' }
      ];
    } else if (this.aliasMold == 'ItemFile') {  //事项文件
      this.allListUrl = queryListByPageUri7;
      this.waitListUrl = queryListUri7;
      this.deleteListUrl = deleteUri7;
      // 数据字典翻译
      this.dictOpts = [
        { dict: 'WY_BUSINESS_STATUS', orgField: 'procedureStatus', destField: 'procedureStatusName' }
      ];
    } else if (this.aliasMold == 'evection') {  //出差申请
      this.allListUrl = queryListByPageUri8;
      this.waitListUrl = queryListUri8;
      this.deleteListUrl = deleteUri8;
      // 数据字典翻译
      this.dictOpts = [
        { dict: 'WY_BUSINESS_STATUS', orgField: 'procedureStatus', destField: 'procedureStatusName' }
      ];
    } else if (this.aliasMold == 'ReserveCarWF') {  //用车申请
      this.allListUrl = queryListByPageUri9;
      this.waitListUrl = queryListUri9;
      this.deleteListUrl = deleteUri9;
      // 数据字典翻译
      this.dictOpts = [
        { dict: 'WY_BUSINESS_STATUS', orgField: 'procedureStatus', destField: 'procedureStatusName' }
      ];
    }
  }
  ionViewDidEnter() {

    this.helper.setIosIconBadgeNumber(0);
    this.loadOrderDataFn(null)
  }
  toggleClick(event: any) {
    this.toggle = event;
    setTimeout(() => {
      this.loadOrderDataFn(null)
    }, 200)
  }
  loadOrderDataFn(refresher) {
    this.nativeService.showLoading();
    let data = {
      appUserId: this.userinfor.staff.userId,
    }
    this.page = 1;
    let pageInfo = { page: 1, pageSize: this.pageSize };
    this.commonLoad(data, pageInfo, refresher, null)
  }
  commonLoad(data, pageInfo, refresher, infiniteScroll) {
    let that = this;
    if (this.toggle == 'AllData') {
      this.http.post(ENV.httpurl + this.allListUrl, data, { params: pageInfo }).subscribe(async result => {
        this.totalCount = result['count'];
        if (!!infiniteScroll) {
          this.allList = this.allList.concat(result['data']);
        } else {
          this.allList = result['data'];
        }
        this.globalData.transformDict(this.dictOpts, this.allList,'oa');
        let wait1 = that.globalData.getWfInstListByBizList(this.allList).then(wfInstList => {
          _.each(this.allList, n => {
            n.wfInst = _.find(wfInstList, d => d['bizId'] == n.id);
          });
        })
        let wait2 = that.globalData.getWfResourceListByBizList(this.allList).then(wfResourceList => {
          _.each(this.allList, n => {
            n.wfResourceList = _.filter(wfResourceList, d => d['bizId'] == n.id);
          });
        });
        await wait1;
        await wait2;
        if (!!refresher) {
          refresher.complete()
        }
        if (!!infiniteScroll) {
          infiniteScroll.complete()
        }
        this.nativeService.hideLoading();
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
    } else if (this.toggle == 'awiatData') {
      that.globalData.getMyNotify(pageInfo, this.aliasMold, false, {}).then(result => {
        this.handleData(result, refresher, infiniteScroll)
      }, error => {
        this.nativeService.hideLoading();
      })
    } else {
      that.globalData.getMyNotify(pageInfo, this.aliasMold, true, {}).then(result => {
        this.handleData(result, refresher, infiniteScroll)
      }, error => {
        this.nativeService.hideLoading();
      })
    }
  }
  handleData(wfResp, refresher, infiniteScroll) {
    let that = this;
    this.totalCount = wfResp['count'];
    if (!!infiniteScroll) {
      this.allList = this.allList.concat(wfResp['data']);
    } else {
      this.allList = wfResp['data'];
    }
    that.globalData.transformDict(this.dictOpts, this.allList,'0a');
    let keys = _.sortedUniq(_.map(this.allList, 'bizId')).filter(n => n); // 取出对应的id列表，去重、排除null
    this.http.post(ENV.httpurl + this.waitListUrl, keys).subscribe(async result => {
      // this.totalCount = wfResp['count'];
      // if(!!infiniteScroll){
      //     this.allList = this.allList.concat(wfResp['data']);
      // }else{
      //     this.allList = wfResp['data'];
      // }
      // that.globalData.transformDict(this.dictOpts, this.allList,'0a);
      // 将查询到的业务数据合并到流程的数据bizData字段里
      _.map(this.allList, (n) => {
        n.bizData = _.find(result, {
          id: n.workflowInstData.bizId
        }); // 这里定义了业务数据放入bizData字段里
      });
      if (!!refresher) {
        refresher.complete()
      }
      if (!!infiniteScroll) {
        infiniteScroll.complete()
      }
      this.nativeService.hideLoading();
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
  // 草稿状态 编辑、查看
  toCreate(entry, opeType) {
    if (this.aliasMold == 'ProjectDaily') {
      this.NavCtrl.push(WorkhoursEditPage, { entry: entry, opeType: opeType, ref: null });
    } else if (this.aliasMold.indexOf('SHIJIA') > -1 || this.aliasMold.indexOf('otherLeave3') > -1 || this.aliasMold.indexOf('Annual1') > -1) {
      this.NavCtrl.push('VacationDraftPage', { entry: entry, opeType: opeType, ref: null });
    } else if (this.aliasMold.indexOf('SealApply') > -1) {  //印章申请
      this.NavCtrl.push('SealDraftPage', { entry: entry, opeType: opeType, ref: null });
    } else if (this.aliasMold.indexOf('ICCard') > -1) {   //身份卡管理
      this.NavCtrl.push('IccardDraftPage', { entry: entry, opeType: opeType, ref: null });
    } else if (this.aliasMold.indexOf('networkResource') > -1) {   //网络资源管理
      this.NavCtrl.push('NetworkDraftPage', { entry: entry, opeType: opeType, ref: null });
    } else if (this.aliasMold == 'goOutFlow') {   //网络资源管理
      this.NavCtrl.push('GooutDraftPage', { entry: entry, opeType: opeType, ref: null });
    } else if (this.aliasMold == 'ItemFile') {  //事项文件
      this.NavCtrl.push('MattersDraftPage', { entry: entry, opeType: opeType, ref: null });
    } else if (this.aliasMold == 'evection') { //出差申请
      this.NavCtrl.push('EvectionDraftPage', { entry: entry, opeType: opeType, ref: null });
    } else if (this.aliasMold == 'ReserveCarWF') {  //用车申请
      this.NavCtrl.push('UserCarDraftPage', { entry: entry, opeType: opeType, ref: null });
    }

  }
  // 查看(我的申请)
  toEditor2(entry, opeType) {
    if (this.aliasMold == 'ProjectDaily') {
      this.NavCtrl.push('EditPage', { entry: entry, id: entry.id, opeType: opeType, ref: entry.wfInst.resourceInstId, wfAlias: entry.wfInst.defAlias });
    } else if (this.aliasMold.indexOf('SHIJIA') > -1 || this.aliasMold.indexOf('otherLeave3') > -1 || this.aliasMold.indexOf('Annual1') > -1) {
      this.NavCtrl.push('VacationEditPage', { entry: entry, id: entry.id, opeType: opeType, ref: entry.wfInst.resourceInstId, wfAlias: entry.wfInst.defAlias });
    } else if (this.aliasMold.indexOf('SealApply') > -1) {  //印章申请
      this.NavCtrl.push('SealEditPage', { entry: entry, id: entry.id, opeType: opeType, ref: entry.wfInst.resourceInstId, wfAlias: entry.wfInst.defAlias });
    } else if (this.aliasMold.indexOf('ICCard') > -1) {   //身份卡管理
      this.NavCtrl.push('IccardEditPage', { entry: entry, id: entry.id, opeType: opeType, ref: entry.wfInst.resourceInstId, wfAlias: entry.wfInst.defAlias });
    } else if (this.aliasMold.indexOf('networkResource') > -1) {   //网络资源管理
      this.NavCtrl.push('NetworkEditPage', { entry: entry, id: entry.id, opeType: opeType, ref: entry.wfInst.resourceInstId, wfAlias: entry.wfInst.defAlias });
    } else if (this.aliasMold == 'goOutFlow') {   //网络资源管理
      this.NavCtrl.push('GooutEditorPage', { entry: entry, id: entry.id, opeType: opeType, ref: entry.wfInst.resourceInstId, wfAlias: entry.wfInst.defAlias });
    } else if (this.aliasMold == 'ItemFile') {  //事项文件
      this.NavCtrl.push('MattersEditPage', { entry: entry, id: entry.id, opeType: opeType, ref: entry.wfInst.resourceInstId, wfAlias: entry.wfInst.defAlias });
    } else if (this.aliasMold == 'evection') { //出差申请
      this.NavCtrl.push('EvectionEditorPage', { entry: entry, id: entry.id, opeType: opeType, ref: entry.wfInst.resourceInstId, wfAlias: entry.wfInst.defAlias });
    } else if (this.aliasMold == 'ReserveCarWF') {  //用车申请
      this.NavCtrl.push('UserCarEditPage', { entry: entry, id: entry.id, opeType: opeType, ref: entry.wfInst.resourceInstId, wfAlias: entry.wfInst.defAlias });
    }
  }
  // 查看/处理(代办和已办)
  toEditor(entry, opeType) {
    if (this.aliasMold == 'ProjectDaily') {
      this.NavCtrl.push('EditPage', { entry: entry, id: entry.bizData.id, opeType: opeType, ref: entry.resourceInstId, wfAlias: entry.workflowAlias });
    } else if (this.aliasMold.indexOf('SHIJIA') > -1 || this.aliasMold.indexOf('otherLeave3') > -1 || this.aliasMold.indexOf('Annual1') > -1) {
      this.NavCtrl.push('VacationEditPage', { entry: entry, id: entry.bizData.id, opeType: opeType, ref: entry.resourceInstId, wfAlias: entry.workflowAlias });
    } else if (this.aliasMold.indexOf('SealApply') > -1) {  //印章申请
      this.NavCtrl.push('SealEditPage', { entry: entry, id: entry.bizData.id, opeType: opeType, ref: entry.resourceInstId, wfAlias: entry.workflowAlias });
    } else if (this.aliasMold.indexOf('ICCard') > -1) {   //身份卡管理
      this.NavCtrl.push('IccardEditPage', { entry: entry, id: entry.bizData.id, opeType: opeType, ref: entry.resourceInstId, wfAlias: entry.workflowAlias });
    } else if (this.aliasMold.indexOf('networkResource') > -1) {   //网络资源管理
      this.NavCtrl.push('NetworkEditPage', { entry: entry, id: entry.bizData.id, opeType: opeType, ref: entry.resourceInstId, wfAlias: entry.workflowAlias });
    } else if (this.aliasMold == 'goOutFlow') {   //网络资源管理
      this.NavCtrl.push('GooutEditorPage', { entry: entry, id: entry.bizData.id, opeType: opeType, ref: entry.resourceInstId, wfAlias: entry.workflowAlias });
    } else if (this.aliasMold == 'ItemFile') {  //事项文件
      this.NavCtrl.push('MattersEditPage', { entry: entry, id: entry.bizData.id, opeType: opeType, ref: entry.resourceInstId, wfAlias: entry.workflowAlias });
    } else if (this.aliasMold == 'evection') { //出差申请
      this.NavCtrl.push('EvectionEditorPage', { entry: entry, id: entry.bizData.id, opeType: opeType, ref: entry.resourceInstId, wfAlias: entry.workflowAlias });
    } else if (this.aliasMold == 'ReserveCarWF') {  //用车申请
      this.NavCtrl.push('UserCarEditPage', { entry: entry, id: entry.bizData.id, opeType: opeType, ref: entry.resourceInstId, wfAlias: entry.workflowAlias });
    }
  }
  // 创建
  addWorkhoursFn() {
    if (this.aliasMold == 'ProjectDaily') {
      this.NavCtrl.push(WorkhoursEditPage, { entry: null, opeType: 'cre', ref: null });
    } else if (this.aliasMold.indexOf('SHIJIA') > -1 || this.aliasMold.indexOf('otherLeave3') > -1 || this.aliasMold.indexOf('Annual1') > -1) {
      this.NavCtrl.push('VacationDraftPage', { entry: null, opeType: 'cre', ref: null });
    } else if (this.aliasMold.indexOf('SealApply') > -1) {  //印章申请
      this.NavCtrl.push('SealDraftPage', { entry: null, opeType: 'cre', ref: null });
    } else if (this.aliasMold.indexOf('ICCard') > -1) {   //身份卡管理
      this.NavCtrl.push('IccardDraftPage', { entry: null, opeType: 'cre', ref: null });
    } else if (this.aliasMold.indexOf('networkResource') > -1) {   //网络资源管理
      this.NavCtrl.push('NetworkDraftPage', { entry: null, opeType: 'cre', ref: null });
    } else if (this.aliasMold == 'goOutFlow') {   //网络资源管理
      this.NavCtrl.push('GooutDraftPage', { entry: null, opeType: 'cre', ref: null });
    } else if (this.aliasMold == 'ItemFile') {    //事项文件
      this.NavCtrl.push('MattersDraftPage', { entry: null, opeType: 'cre', ref: null });
    } else if (this.aliasMold == 'evection') {   //出差申请
      this.NavCtrl.push('EvectionDraftPage', { entry: null, opeType: 'cre', ref: null });
    } else if (this.aliasMold == 'ReserveCarWF') {  //用车申请
      this.NavCtrl.push('UserCarDraftPage', { entry: null, opeType: 'cre', ref: null });
    }

  }
  //草稿状态删除
  delete(entry) {
    this.showAlert(entry);
  }
  deleteId(entry) {
    this.nativeService.showLoading();
    this.http.get(ENV.httpurl + this.deleteListUrl + '/' + entry.id).subscribe(result => {
      this.loadOrderDataFn(null)
      this.nativeService.hideLoading();
    }, error => {
      this.nativeService.hideLoading();
    })

  }
  async showAlert(entry) {
    let confirm = this.alerCtrl.create({
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
            this.deleteId(entry);
          }
        }
      ]
    });
    await confirm.present();
  }
}
