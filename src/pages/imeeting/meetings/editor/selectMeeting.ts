import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { ENV } from '@env/environment';
import { HttpClient } from '@angular/common/http';
import { NativeService } from '../../../../icommon/provider/native';

@Component({
    selector: 'page-selectMeeting',
    templateUrl: 'selectMeeting.html'
})


export class SelectMeetingPage{
    
    entry:any = {};
    data:any;
    selectRadio:string="";
    callback;
    dataList:any = [];
    id:any;
    constructor(public NavCtrl:NavController,public http:HttpClient,public navParams:NavParams, public NativeService: NativeService){
         //接收myorder页面的searchBack
         this.callback = this.navParams.get('callback');
         this.id = this.navParams.get('id');

    }
    ionViewDidEnter(){
        this.queryPage();
    }
    goback(){
        this.NavCtrl.pop();
        // let sender;
        // for(let i=0;i<this.data.length;i++){
        //     if(this.data[i].id == this.selectRadio){
        //         sender = this.data[i];
        //         break;
        //     }
        // }
        // this.dataList.push(sender);
        // this.callback({ 'dataList': this.dataList}).then(() => {
        //     this.NavCtrl.pop();
        // });
    }
    queryPage(){
        this.http.get(ENV.httpurl + '/api/meetingApi/queryMeetingRoom').subscribe(data =>{
            for(let d in data){
                data[d].checked = false;   
            }
            if(!!this.id){
                this.selectRadio = this.id;
            }
            this.data =data;
  
        })  
    }
    close(){
        if(this.selectRadio == null || this.selectRadio==""){
            this.NativeService.showAlert("请选择会议室");
        }else{
            let sender;
            for(let i=0;i<this.data.length;i++){
                if(this.data[i].id == this.selectRadio){
                    sender = this.data[i];
                    break;
                }
            }
            this.dataList.push(sender);
            this.callback({ 'dataList': this.dataList}).then(() => {
                this.NavCtrl.pop();
            });
        }  
    }
    //选择会议室
    select(item){
        this.entry = item;
    }
}