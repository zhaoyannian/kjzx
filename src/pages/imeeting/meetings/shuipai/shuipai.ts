import { Component } from '@angular/core';
import { NavController,NavParams, IonicPage} from 'ionic-angular';
import { HttpClient } from '@angular/common/http'
import { ENV } from '@env/environment';
import { EditorViewPage } from '../editor/editorView';
@IonicPage()
@Component({
    selector:'page-meetings-shuipai',
    templateUrl:'shuipai.html'
})

export class ShuiPaiPage{
    newEntity:any;
    dateStr:any;
    listData:any=[];
    nextMore:any;
    pageEntry:any={
        page: 1, // 先默认第1页
        pageSize: 5, // 每次获取数量
        data: []
    }
    constructor(public NavCtrl:NavController, public navParams: NavParams,public http:HttpClient){
        this.newEntity = this.navParams.get("entity");
        if(!!this.newEntity){
            this.requestData(this.pageEntry);
        }else{
            location.href = '/';
        }
    }
    goback(){
        this.NavCtrl.pop();
    }
    ionViewDidLoad() {
    }

    // 初始化数据
    // initData() {
    //     this.requestData(this.pageEntry);
    // }

    //获取水牌信息方法
    requestData(pageEntry) {
        var self = this;
        var pageInfo = {
            page: pageEntry.page,
            pageSize: pageEntry.pageSize
        };
        let year = this.newEntity.meetingDate.getFullYear();
        let month = this.newEntity.meetingDate.getMonth() + 1;
        let monthStr = month > 9 ? month + '' : '0' + month;
        let day = this.newEntity.meetingDate.getDate();
        let dayStr = day > 9 ? day + '' : '0' + day;
        this.dateStr = year + '-' + monthStr + '-' + dayStr;
        return this.http.get(ENV.httpurl +'/api/meetingApi/queryMeetingTody'+'/'+self.dateStr+'/'+ this.newEntity.status, { params: pageInfo }).subscribe(
            data => {
            this.listData = data;
        });
    }

    goView(entry) {
        this.NavCtrl.push(EditorViewPage, { 'busId':  entry.id });
    }
    myApplay(){
        this.NavCtrl.push("MyReplymeetingPage")
    }
}