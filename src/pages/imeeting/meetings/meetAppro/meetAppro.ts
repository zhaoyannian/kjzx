import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { NativeService } from '../../../../icommon/provider/native';
import { ENV } from '@env/environment';
import { HttpClient } from '@angular/common/http';
import { globalData } from '../../../../icommon/provider/globalData';
import { EditorApproPage } from './editorAppro';
@Component({
    selector: 'page-meetAppro',
    templateUrl: 'meetAppro.html',
})
export class MeetApproPage {
    list: any = [];
    state: any = ENV.httpurl;
    pageInfo: any = {
        page: 1,//第几页
        pageSize: 5,//一页多少条
    }
    infiniteScroll: any;
    constructor(public globalData: globalData, public nativeService: NativeService, public navCtrl: NavController, public navParams: NavParams, public http: HttpClient) {

        // this.loadOrderDataFn(null)
    }
    ionViewDidEnter() {
        this.loadOrderDataFn(null)
    }
    goback(){
        this.navCtrl.pop();
    }
    init(refresher, infiniteScroll) {
        this.http.post(ENV.httpurl + '/api/meetingApi/queryPM', {
            statusCodeArr: ['1']
        }, { params: this.pageInfo }).subscribe(resp => {
            if (this.pageInfo.page == 1) {
                //第一页
                // this.list = resp['data'].slice(1);
                this.list = resp['data'];
            } else {
                this.list = this.list.concat(resp['data']);
            }
            let dictOpts = [{
                dict: 'COA_MEETING_STATUS', orgField: 'meetingStatus', destField: 'state'
            }];
            this.globalData.transformDict(dictOpts, this.list,'oa');

            let clzName = 'com.stonewomb.meetingroom.entity.MeetingRoomInfo';
            let inputField = 'meetingAddress';
            let indexedField = 'id';
            let valueFields = ['name'];
            let destFields = ['meetingRoomName'];
            this.globalData.transformEntity(clzName, inputField, indexedField, valueFields, destFields, this.list,'oa');

            if (!!refresher) {
                refresher.complete()
            }
            if (!!infiniteScroll) {
                infiniteScroll.complete();
                if (this.list.length >= resp['count'] - 1) {
                    infiniteScroll.enable(false);
                    this.infiniteScroll = infiniteScroll;
                }
            }
            this.nativeService.hideLoading();
        })
    }
    loadOrderDataFn(refresher) {
        this.nativeService.showLoading();
        this.init(refresher, null)
    }
    //刷新
    tabslideRefreshFn(refresher) {
        this.list = [];
        this.pageInfo.page = 1;
        if (!!this.infiniteScroll) {
          //为了解决翻到最后一页，翻页组件被enable(false)禁用，刷新后不能在翻页的问题
          this.infiniteScroll.enable(true);
        }
        this.loadOrderDataFn(refresher);
    }
    //下拉分页查询
    tabslideNextRefreshFn(infiniteScroll) {
        this.pageInfo.page += 1;
        this.init(null, infiniteScroll)
    }

    toEditor(entry) {
        // this.navCtrl.push(EditorApproPage,{selectMr:entry});
        this.navCtrl.push(EditorApproPage, { 'busId': entry.id });
    }
}