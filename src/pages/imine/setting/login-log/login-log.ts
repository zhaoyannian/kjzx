import { NativeService } from '.././../../../icommon/provider/native';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,LoadingController } from 'ionic-angular';
import { globalData } from '../../../../icommon/provider/globalData';
import { HttpClient } from '@angular/common/http';
import { ENV } from '@env/environment';
@IonicPage()
@Component({
  selector: 'page-login-log',
  templateUrl: 'login-log.html',
})
export class LoginLogPage {
  notice:any;
  constructor(public navCtrl: NavController, public navParams: NavParams, public globalData: globalData,
    public http: HttpClient,
    public NativeService:NativeService,
    public loadingCtrl: LoadingController) {
    let noticeList = JSON.parse(localStorage.getItem("noticeList"));
    if(!!noticeList) {
      this.notice = {
        weixinNotice:noticeList[0].weixinNotice,
        weixinGzhNotice:noticeList[0].weixinGzhNotice,
        messageNotice:noticeList[0].messageNotice,
        mailNotice:noticeList[0].mailNotice,
        duanXinNotice:noticeList[0].duanXinNotice
      }
    }else{
      this.notice = {
        weixinNotice:true,
        weixinGzhNotice:true,
        messageNotice:true,
        mailNotice:true,
        duanXinNotice:true
      }
    }
    
  }

  ionViewDidLoad() {
  }
  goback(){
    this.navCtrl.pop();
  }
  save(){
    // api/staff/updateStaffNotice   post传值  参数 id、weixinNotice、weixinGzhNotice、messageNotice、mailNotice、duanXinNotice
    let objectList = JSON.parse(localStorage.getItem("objectList"));    
    let parmas={
        id:objectList.staff.id,
        weixinNotice: this.notice.weixinNotice,
        weixinGzhNotice:this.notice.weixinGzhNotice,
        messageNotice:this.notice.messageNotice,
        mailNotice:this.notice.mailNotice,
        duanXinNotice:this.notice.duanXinNotice
      }
      this.http.post(ENV.httpurl + "/api/staff/updateStaffNotice", parmas).subscribe(data => {
        if(data['result']==true){
          localStorage.setItem("noticeList", JSON.stringify([parmas]));
        }else{
          this.NativeService.showToast("操作失败");
        }
      })
  }

}
