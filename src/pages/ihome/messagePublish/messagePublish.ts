import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { NativeService } from './../../../icommon/provider/native';
import { HttpClient } from '@angular/common/http'
import { ENV } from '@env/environment';
import { EditorPage } from './editor/editor';


@IonicPage()
@Component({
  selector: 'page-messagePublish',
  templateUrl: 'messagePublish.html',
})
export class MessagePublishPage {
  toggle = 'todo';
  data: any = [];
  wfInstStatuss:any ={ inprocess: '流转中', complate: '办结', terminal: '终止' };
   //第几页
   page: any = 1;
   //一页多少条
   pageSize: any = 3;
   //总条数
   totalCount: number;
   //当前页签
   status: any = "";
   search: any = '';
  constructor(public nativeService: NativeService, public navCtrl: NavController, public navParams: NavParams, public http: HttpClient) {
    this.selectData(this.toggle);
  }

  ionViewDidLoad() {
  }

  selectData(type){
    this.page = 1;
    this.pageSize = 3;
    this.nativeService.showLoading();
    switch (type) {
      case "todo":
        this.status = '';
        break;
      case "hasDone":
        this.status = 'waiting';
        break;
      case "allList":
        this.status = 'accept';
        break;
    }
    let pageInfo = { params: { queryKey: this.search, page: this.page, pageSize: this.pageSize } };
    this.http.post(ENV.httpurl + "/api/orderInfo/getOrderInfo", { orderState: this.status }, pageInfo).subscribe(data => {
      this.nativeService.hideLoading();
      this.data = data['listData'];
      this.totalCount = data['count'];
    }, () => {
      this.nativeService.hideLoading();
    });
  }

   //刷新
   orderRefreshFn(refresher) {
    this.page = 1;
    this.pageSize = 3;
    let pageInfo = { params: { queryKey: this.search, page: this.page, pageSize: this.pageSize } };
    this.http.post(ENV.httpurl + "/api/orderInfo/getOrderInfo", { orderState: this.status }, pageInfo).subscribe(data => {
      this.data = data['listData'];
      refresher.complete();
    });
  }
  //下拉分页查询
  orderNextRefreshFn(infiniteScroll) {
    if (this.totalCount == this.data.length) {
      infiniteScroll.complete();
    } else {
      this.page += 1;
      let pageInfo = { params: { queryKey: this.search, page: this.page, pageSize: this.pageSize } };
      this.http.post(ENV.httpurl + "/api/orderInfo/getOrderInfo", { orderState: this.status }, pageInfo).subscribe(data => {
        this.data = this.data.concat(data['listData']);
        infiniteScroll.complete();
      });
    }
  }

  addMessagePublish(){
    this.navCtrl.push(EditorPage,{'entity':{}});
  }
}
