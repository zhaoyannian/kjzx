import { NativeService } from './../../../../icommon/provider/native';
import { Component } from '@angular/core';
import {  NavController, NavParams, ToastController, LoadingController } from 'ionic-angular';
import { globalData } from '../../../../icommon/provider/globalData';
import { HttpClient } from '@angular/common/http';
import { ENV } from '@env/environment';
import * as $ from 'jquery';
// import { FormGroup, FormBuilder, Validators } from '@angular/forms';
// import { Location } from '@angular/common';
@Component({
  selector: 'page-changepwd',
  templateUrl: 'changepwd.html',
})
export class ChangepwdPage {
  userinfo:any={};
  newPassword:any ='';
  againstPassword:any ='';
  userPsw:any='';
  // registerForm: FormGroup;
  constructor(public navCtrl: NavController, public navParams: NavParams,  public globalData: globalData,
    public http: HttpClient,
    // private fb: FormBuilder,
     public NativeService:NativeService,
    public toastCtrl: ToastController,public loadingCtrl: LoadingController
  ) {
    // this.registerForm = this.fb.group({
    //   userPsw:['',[Validators.required, Validators.minLength(3)]],
    //   newPassword:['',[Validators.required, Validators.minLength(3)]],
    //   againstPassword:['',[Validators.required, Validators.minLength(3)]],
    // })
    // api/staff/updatePassword     post传值   参数 userId、新密码:newPassword
    // api/staff/validPassword   post传值  参数 userId、旧密码:userPsw

  }
  ionViewDidLoad() {
  }
  goback(){
    this.navCtrl.pop();
  }
  // getRegister():void {
    
  // }
  async getRegister() {
    if(!this.userPsw){
      this.NativeService.showToast("请输入正确的旧密码")
      return;
    }else if(!this.newPassword && (this.newPassword.length<6 || this.newPassword>32)){
      this.NativeService.showToast("新密码长度至少6个字符，最多32个字符")
      return
    }else if(!this.againstPassword && (this.againstPassword.length<6 || this.againstPassword>32)){
      this.NativeService.showToast("确认密码长度至少6个字符，最多32个字符")
      return
    }else{
      let loginObj = JSON.parse(localStorage.getItem("objectList"));
      let parmas2={
      'userId':loginObj.staff.userId,
      'userPsw':this.userPsw
      }
      this.http.post(ENV.httpurl + "/api/staff/validPassword ", parmas2).subscribe(data => {
        if(data['result']==true){
          this.submit(loginObj.staff.userId)
        }else{
          this.NativeService.showAlert("旧密码输入不正确!");
        }
      })
    }
    
  }
  submit(userId){
    if(this.againstPassword!=this.newPassword){
      this.NativeService.showAlert("确认密码与新密码不一致!");
    }else{
      let parmas={
        userId:userId,
        newPassword:this.newPassword
      }
      let loading = this.loadingCtrl.create({
        spinner: 'crescent',
      });
      this.http.post(ENV.httpurl + "/api/staff/updatePassword ", parmas).subscribe(data => {
        if(data['result']==true){
          loading.dismiss();
          this.NativeService.showToast("修改成功").then(()=>{
            setTimeout(() => {
              this.navCtrl.pop()
            },800)
          })
        }else{
          this.NativeService.showToast("修改失败");
          loading.dismiss();
        }
      })
    }
  }
  changePwd(item){
    if(item ==1){
      if($("#userPsw input").attr("type") == "password"){
        $("#userPsw input").attr("type","text");
        $('.icon1').removeClass('icon-biyan')
        $('.icon1').addClass('icon-yanjing')
      }else{
        $("#userPsw input").attr("type","password");
        $('.icon1').addClass('icon-biyan')
        $('.icon1').removeClass('icon-yanjing')
      }
    }else if(item ==2){
      if($("#newPassword input").attr("type") == "password"){
        $("#newPassword input").attr("type","text");
        $('.icon2').removeClass('icon-biyan')
        $('.icon2').addClass('icon-yanjing')
      }else{
        $("#newPassword input").attr("type","password");
        $('.icon2').addClass('icon-biyan')
        $('.icon2').removeClass('icon-yanjing')
      }
    }else{
      if($("#againstPassword input").attr("type") == "password"){
        $("#againstPassword input").attr("type","text");
        $('.icon3').removeClass('icon-biyan')
        $('.icon3').addClass('icon-yanjing')
      }else{
        $("#againstPassword input").attr("type","password");
        $('.icon3').addClass('icon-biyan')
        $('.icon3').removeClass('icon-yanjing')
      }
    }
   
  }
}
