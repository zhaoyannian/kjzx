import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ENV } from '@env/environment';
import { HttpClient } from '@angular/common/http';
import { NativeService } from '../../../../icommon/provider/native';
import _ from 'lodash';

@IonicPage()
@Component({
    selector: 'page-select-car',
    templateUrl: 'select-car.html'
})
export class SelectCarPage {
    entry: any = {};
    data: any = [];
    dataList: any = [];
    entity: any;
    callback;
    loginObj: any = {};
    state: any = ENV.httpurl;
    params: any = {
        page: 1,//当前页码
        pageSize: 10,
        queryKey: ''
    }
    infiniteScroll: any;
    userLogin: any = {};
    type: any;
    isShow: any;
    historyList: any = [];
    weekDays: any = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    constructor(public NavCtrl: NavController, public nat: NativeService, public http: HttpClient, public navParams: NavParams) {
        this.loginObj = JSON.parse(localStorage.getItem("objectList"));
        //接收myorder页面的searchBack
        this.callback = this.navParams.get('callback');
        this.dataList = this.navParams.get("CarList");
        this.entity = this.navParams.get("entity");
    }
    ionViewDidEnter() {
        this.loadOrderDataFn(null)
    }
    loadOrderDataFn(refresher) {
        this.nat.showLoading();
        this.queryPage(refresher, null)
    }
    queryPage(refresher, infiniteScroll) {
        this.http.post(ENV.httpurl + '/api/ReserveCar/queryVehiclesByPage', {}, { params: this.params }).subscribe(resp => {
            if (this.params.page == 1) {
                this.data = resp['data'];
            } else {
                this.data = this.data.concat(resp['data']);
            }
            //整合车辆状态和限行问题   --- todo
            _.map(this.data, (n) => {
                if (!!n.id) {
                    this.entity.theCarid = n.id;
                    this.http.post(ENV.httpurl + '/api/ReserveCar/queryReseByCarIdDate', this.entity).subscribe(resp => {
                        this.historyList = resp;
                        if (this.historyList.length > 0) {
                            n.status = '使用中';
                        } else {
                            n.status = '待使用';
                        }
                    });
                }

                if (!!this.entity.showOutTime) {
                    let date = new Date(this.entity.showOutTime);
                    let btime = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getUTCDate();
                    this.http.get(ENV.httpurl + '/api/ReserveCar/queryLimitByDate/' + btime).subscribe(data => {
                        let date = new Date(this.entity.showOutTime);
                        let num = data[this.weekDays[date.getDay()]];
                        if (_.includes(num, n.numberPlate.substring(n.numberPlate.length - 1))) {
                            n.limit = '限行';
                        }
                    });
                }
            });

            for (let d in this.data) {
                if (!!this.dataList && this.data[d].id === this.dataList.id) {
                    this.data[d].checked = true;
                }
            }

            if (!!refresher) {
                refresher.complete()
            }
            if (infiniteScroll) {
                infiniteScroll.complete();
                if (this.data.length >= resp['count'] - 1) {
                    infiniteScroll.enable(false);
                    this.infiniteScroll = infiniteScroll;
                }
            }
            this.nat.hideLoading();
        }, error => {
            this.nat.hideLoading();
        })
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

    //选择车辆
    chooseItem(item) {
        if (item.status === '使用中') {
            this.nat.showAlert("该车该时间段有行程，请慎重选择");
        }
        if (item.limit === '限行') {
            this.nat.showAlert("该车该时间段限行，请慎重选择");
        }
        this.data.forEach(element => {
            element.checked = false;
        });
        item.checked = true;
        this.isShow = _.find(this.data, function (o) {
            return o.checked == true;
        });
    }

    getItems(e) {
        if (!!e.target.value) {
            this.params.page = 1;
            this.params.queryKey = e.target.value;

        } else {
            this.params.page = 1;
            this.params.queryKey = '';
        }
        this.loadOrderDataFn(null)
    }

    close() {
        let item = _.find(this.data, function (o) {
            return o.checked == true;
        });
        this.callback({ 'dataList': item }).then(() => {
            this.NavCtrl.pop();
        });
    }
    goback(){
        this.NavCtrl.pop();
      }
}