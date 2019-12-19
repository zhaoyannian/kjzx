import { NativeService } from './../../../icommon/provider/native';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { ENV } from '@env/environment';
import { HttpClient } from '@angular/common/http';

@IonicPage()
@Component({
  selector: 'page-forgetpwd2',
  templateUrl: 'forgetpwd2.html',
})
export class Forgetpwd2Page {
  username:any;
  userId:any;
  constructor(public http: HttpClient,public navCtrl: NavController, public navParams: NavParams,public NativeService:NativeService) {
    this.username=this.navParams.get("username"); 
    this.userId=this.navParams.get("userId");
  }
  goback(){
    this.navCtrl.pop();
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad Forgetpwd2Page');
  }
  next(password,passwordRepeat){
    if(password.value.length == 0 || passwordRepeat.value.length==0){
      this.NativeService.showAlert("请输入密码!");
      return
    }
    if(passwordRepeat.value !=password.value ){
      this.NativeService.showAlert("重复密码与密码不一致!");
      return
    }
    let parmas={
      userId:this.userId,
      newPassword:password.value
    }
    this.http.post(ENV.httpurl + "/api/staff/updatePassword", parmas).subscribe(data => {
      if(data['result']==true){
        this.navCtrl.push('Forgetpwd3Page');
      }else{
        this.NativeService.showToast("修改失败");
      }
    },error =>{

    })
  }
}
