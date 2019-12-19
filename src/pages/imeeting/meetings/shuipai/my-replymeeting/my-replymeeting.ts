import { Component } from '@angular/core';
import { NavController, NavParams, IonicPage, AlertController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http'
import { ENV } from '@env/environment';
import { NativeService } from '../../../../../icommon/provider/native';
import { EditorViewPage } from '../../editor/editorView';
import _ from 'lodash';
/**
 * Generated class for the MyReplymeetingPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-my-replymeeting',
  templateUrl: 'my-replymeeting.html',
})
export class MyReplymeetingPage {
  newEntity: any;
  dateStr: any;
  listData: any = [];
  nextMore: any;
  params: any = {
    page: 1,//当前页码
    pageSize: 10,
  }
  meetingStatuss: any;
  infiniteScroll: any;
  totalCount:any;
  nowdate:any;
  constructor(private alerCtrl: AlertController, public NavCtrl: NavController, public navParams: NavParams, public http: HttpClient, public NativeService: NativeService) {
    this.meetingStatuss = { 0: '草稿', 1: '审批中', 2: '完成', 3: '未通过' ,4:'已取消',5:'已结束',6:'未开始',7:'进行中'};
    this.nowdate = new Date().getTime();
  }

  ionViewDidLoad() {
    this.params.page = 1;
    this.init(null, null)

  }
  //获取水牌信息方法
  init(refresher, infiniteScroll) {
    this.NativeService.showLoading();
    this.http.post(ENV.httpurl + '/api/meetingApi/querylistMyMeeting?page=' + this.params.page + '&pageSize=' + this.params.pageSize, this.params).subscribe(resp => {
      // if (this.params.page == 1) {
      this.totalCount = resp['count'];
      this.listData = resp['date'];
      _.map(this.listData,n=>{
        if(n.meetingStatus =='2' || n.meetingStatus =='1'){
          if(n.meetingDateEnd<this.nowdate){
            n.meetingStatus = '5';
          } 
          else if(n.meetingDateBegin > this.nowdate){
            n.meetingStatus = '6';
          }
          else if( n.meetingDateBegin < this.nowdate  &&  this.nowdate< n.meetingDateEnd){
            n.meetingStatus = '7';
          }
        }
      })
      if (!!refresher) {
        refresher.complete()
      }
      // if (infiniteScroll) {
      //   infiniteScroll.complete();
      //   if (this.listData.length >= resp['count'] - 1) {
      //     infiniteScroll.enable(false);
      //     this.infiniteScroll = infiniteScroll;
      //   }
      // }
      this.NativeService.hideLoading();

    }, error => {
      this.NativeService.hideLoading();
    });
  }
  //刷新
  tabslideRefreshFn(refresher) {
    this.params.page = 1;
    if (!!this.infiniteScroll) {
      //为了解决翻到最后一页，翻页组件被enable(false)禁用，刷新后不能在翻页的问题
      this.infiniteScroll.enable(true);
    }
    this.init(null, refresher)
  }
  //下拉分页查询
  tabslideNextRefreshFn(infiniteScroll) {
    if (this.totalCount == this.listData.length) {
      infiniteScroll.complete();
    } else {
      this.params.page += 1;
      this.http.post(ENV.httpurl + '/api/meetingApi/querylistMyMeeting?page=' + this.params.page + '&pageSize=' + this.params.pageSize, this.params).subscribe(resp => {
        this.listData = this.listData.concat(resp['date']);
        _.map(this.listData,n=>{
          if(n.meetingStatus =='2' || n.meetingStatus =='1'){
            if(n.meetingDateEnd<this.nowdate){
              n.meetingStatus = '5';
            } 
            else if(n.meetingDateBegin > this.nowdate){
              n.meetingStatus = '6';
            }
            else if( n.meetingDateBegin < this.nowdate  &&  this.nowdate< n.meetingDateEnd){
              n.meetingStatus = '7';
            }
          }
        })
        infiniteScroll.complete();
      })
    }
  }
  cancle(item) {
    this.alerCtrl.create({
      title: "您确定要取消预定么？",
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
            if (item.meetingDateBegin > new Date().getTime()) {
              this.NativeService.showLoading();
              this.http.get(ENV.httpurl + '/api/meetingApi/cancelMeetingInfo.curd/' + item.id).subscribe(resp => {
                this.NativeService.hideLoading();
                this.NativeService.showToast("取消成功").then(() => {
                  this.params.page = 1;
                  this.init(null, null)
                  // setTimeout(() => {
                  //   // this.navCtrl.pop()
                  // }, 800)
                })  // 流程提交后 返回的页面
              }, error => {
                this.NativeService.hideLoading();
              })
            } else {
              this.NativeService.showAlert("会议时间已过！")
            }

          }
        }
      ]
    }).present();
  }
  goback() {
    this.NavCtrl.pop();
  }
  goView(entry) {
    this.NavCtrl.push(EditorViewPage, { 'busId': entry.id });
  }
}
