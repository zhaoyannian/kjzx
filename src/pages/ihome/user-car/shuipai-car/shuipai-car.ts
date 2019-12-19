import { Component } from '@angular/core';
import { NavController, NavParams, IonicPage } from 'ionic-angular';
import { HttpClient } from '@angular/common/http'
import { ENV } from '@env/environment';
import { NativeService } from '../../../../icommon/provider/native';
import _ from 'lodash';
@IonicPage()
@Component({
    selector: 'page-shuipai-car',
    templateUrl: 'shuipai-car.html'
})

export class ShuiPaiCarPage {
    // newEntity: any;
    dateStr: any;
    listData: any = [];
    listDataNew: any = [];
    nextMore: any;
    params: any = {
        page: 1,//当前页码
        pageSize: 10,
        queryKey: ''
    };
    infiniteScroll: any;
    //当前选择的分组按钮
    toggle = 'awiatData';
    constructor(public NavCtrl: NavController, public nat: NativeService, public navParams: NavParams, public http: HttpClient) {
        // this.newEntity = this.navParams.get("entity");
    }

    ionViewDidEnter() {
        this.loadOrderDataFn(null)
    }
    loadOrderDataFn(refresher) {
        this.nat.showLoading();
        this.queryPage(refresher, null)
    }
    toggleClick(event: any){
        this.toggle = event;
        setTimeout(()=>{
            this.loadOrderDataFn(null)
        },200)
    }
    //获取水牌信息方法
    queryPage(refresher, infiniteScroll) {
        this.http.post(ENV.httpurl + '/api/ReserveCar/queryArrangementByPage',{}, { params: this.params }).subscribe(
            resp => {
                if (this.params.page == 1) {
                    this.listData = resp['data'];
                } else {
                    this.listData = this.listData.concat(resp['data']);
                }
                //未进行
                if(this.toggle == 'awiatData'){
                    this.listDataNew = _.filter(this.listData,(n) => n.showOutTime > new Date());
                }else if(this.toggle == 'complateData'){   //已完成
                    this.listDataNew = _.filter(this.listData,(n) => n.showEndTime < new Date());
                }else{  //进行中
                    this.listDataNew = _.filter(this.listData,(n) => n.showEndTime >= new Date() && n.showOutTime <= new Date());
                }

                if (!!refresher) {
                    refresher.complete()
                }
                if (infiniteScroll) {
                    infiniteScroll.complete();
                    if (this.listData.length >= resp['count'] - 1) {
                        infiniteScroll.enable(false);
                        this.infiniteScroll = infiniteScroll;
                    }
                }
                this.nat.hideLoading();
            },error =>{
                this.nat.hideLoading();
            });
    }


    //刷新
    tabslideRefreshFn(refresher) {
        this.params.page = 1;
        if (!!this.infiniteScroll) {
            //为了解决翻到最后一页，翻页组件被enable(false)禁用，刷新后不能在翻页的问题
            this.infiniteScroll.enable(true);
        }
        this.loadOrderDataFn(refresher);
    }
    //下拉分页查询
    tabslideNextRefreshFn(infiniteScroll) {
        this.params.page += 1;
        this.queryPage(null, infiniteScroll)
    }

    goView(entry) {
        this.NavCtrl.push('UserCarViewPage', { 'id': entry.id });
    }
    goback(){
        this.NavCtrl.pop();
      }
}