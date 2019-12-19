import { NativeService } from './../../../icommon/provider/native';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ENV } from '@env/environment';
import { HttpClient } from '@angular/common/http';


@IonicPage()
@Component({
  selector: 'page-forgetpwd',
  templateUrl: 'forgetpwd.html',
})
export class ForgetpwdPage {
  code;//验证码
  constructor(public http: HttpClient, public navCtrl: NavController, public navParams: NavParams, public NativeService: NativeService) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ForgetpwdPage');
  }
  goback(){
    this.navCtrl.pop();
  }
  ionViewDidEnter() {
    this.drawPic('ValidCode12');
  }
  next(username, validcode) {
    if (username.value.length == 0) {
      this.NativeService.showAlert("请输入账号!");
      this.drawPic('ValidCode12');
      return
    }
    if (validcode.value == '') {
      this.NativeService.showAlert("请输入验证码!");
      this.drawPic('ValidCode12');
      return
    }
    if (validcode.value.toLowerCase() != this.code.toLowerCase()) {
      this.drawPic('ValidCode12');
      this.NativeService.showAlert("验证码错误!");
      return
    }
    this.http.post(ENV.httpurl + "/api/login/validUserExist/" + username.value, {}).subscribe(data => {
      if (data['ifUserExist'] == true) {
        this.navCtrl.push('Forgetpwd2Page', { username: username.value, userId:data['userId'] }); 
      } else {
        this.NativeService.showAlert("账号输入有误!");
        return
      }
    }, error => {
      console.log(error)
    })
  }
  /**生成一个随机数**/
  randomNum(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }
  /**生成一个随机色**/
  randomColor(min, max) {
    var r = this.randomNum(min, max);
    var g = this.randomNum(min, max);
    var b = this.randomNum(min, max);
    return "rgb(" + r + "," + g + "," + b + ")";
  }
  /**绘制验证码图片**/
  drawPic(elID) {
    console.log(document.getElementById(elID));
    let canvas: any = document.getElementById(elID);
    var width = canvas.getAttribute('width');
    var height = canvas.getAttribute('height');
    //获取该canvas的2D绘图环境 
    var ctx = canvas.getContext('2d');
    ctx.textBaseline = 'bottom';
    /**绘制背景色**/
    ctx.fillStyle = this.randomColor(255, 255);
    //颜色若太深可能导致看不清
    ctx.fillRect(0, 0, width, height);
    /**绘制文字**/
    var str = 'ABCEFGHJKLMNPQRSTWXY123456789';
    　　this.code = "";
    　　　　　//生成四个验证码
    for (var i = 1; i <= 4; i++) {
      var txt = str[this.randomNum(0, str.length)];
      this.code = this.code + txt;
      ctx.fillStyle = this.randomColor(0, 0);
      //随机生成字体颜色
      ctx.font = '26px SimHei';
      //随机生成字体大小
      var x = i * 20;
      var y = this.randomNum(35, 45);
      var deg = this.randomNum(-45, 0);
      //修改坐标原点和旋转角度
      ctx.translate(x, y);
      ctx.rotate(deg * Math.PI / 360);
      ctx.fillText(txt, 0, 0);
      //恢复坐标原点和旋转角度
      ctx.rotate(-deg * Math.PI / 360);
      ctx.translate(-x, -y);
    }
    console.log(this.code);
    return this.code;
  }
}
