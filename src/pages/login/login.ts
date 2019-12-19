import { NativeService } from './../../icommon/provider/native';
import { Component, NgModule } from '@angular/core';
import { NavController, NavParams, Platform, ToastController } from 'ionic-angular';
import { TabsPage } from "../tabs/tabs";
import { HttpClient } from '@angular/common/http';
import { ENV } from '@env/environment';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Helper } from '../../icommon/provider/jpush';
import { BackButtonService } from '../../icommon/provider/backButton.service';
import { SplashScreen } from '@ionic-native/splash-screen';
declare let window;
import _ from 'lodash';
import { Keyboard } from '@ionic-native/keyboard';
/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
@NgModule({
  imports: [ReactiveFormsModule]
})
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  remember: boolean = true;
  myForm: FormGroup;
  myArpForm: FormGroup;
  showcode = false;
  code;//验证码
  clickStatus = true;
  toggle = 'false';
  // backButtonPressed = false;
  constructor(public NativeService: NativeService, public navCtrl: NavController, public navParams: NavParams,
    private platform: Platform, private backButtonService: BackButtonService, splashScreen: SplashScreen,
    public http: HttpClient, public fb: FormBuilder, public helper: Helper, public toastCtrl: ToastController) {
    this.platform.ready().then(() => {
      splashScreen.hide();
      this.platform.registerBackButtonAction(() => {
        this.backButtonService.registerBackButtonAction(null);
        // if (this.backButtonPressed) {
        //     this.platform.exitApp();
        //   } else {
        //       //第一次按，弹出Toast
        //         this.toastCtrl.create({
        //             message: '再按一次退出应用',
        //             duration: 2000,
        //             position: 'top'
        //         }).present();
        //     //标记为true
        //     this.backButtonPressed = true;
        //     //两秒后标记为false，如果退出的话，就不会执行了
        //     setTimeout(() => this.backButtonPressed = false, 2000);
        //   }
      });
    });

    this.myForm = this.fb.group({
      loginCode: ['', [Validators.required]],
      userPsw: ['', [Validators.required]],
      validcode: ['']
    });
    this.myArpForm = this.fb.group({
      arpNumber: ['', [Validators.required]],
      arpPwd: ['', [Validators.required]]
    });
    if (!!localStorage['remember'] && localStorage['remember'] != 'undefined') {
      this.myForm.get('loginCode').setValue(JSON.parse(localStorage['remember']).a);
      this.myForm.get('userPsw').setValue(JSON.parse(localStorage['remember']).b);
      this.myArpForm.get('arpNumber').setValue(JSON.parse(localStorage['remember']).c);
      this.myArpForm.get('arpPwd').setValue(JSON.parse(localStorage['remember']).d);
    }
  }

  ionViewDidLoad() {
    // this.footerTop();
  }

  ionViewDidEnter() {

  }

  /**
   * 防止键盘弹出顶起footer
   */
  footerTop() {
    let element: any = document.getElementsByClassName('bottom-con')[0];
    element.style.top = (window.innerHeight - 35) + 'px';
  }

  logIn() {
    if (!!!this.myForm.value.loginCode) {
      this.NativeService.showToast("请输入账号");
      return
    }
    if (!!!this.myForm.value.userPsw) {
      this.NativeService.showToast("请输入密码");
      return
    }
    if (this.showcode && this.myForm.value.validcode.toLowerCase() != this.code.toLowerCase()) {
      this.NativeService.showToast("验证码错误");
      this.drawPic();
      return
    }
    // if (!!!this.myForm.value.vpnNumber) {
    //     this.NativeService.showToast("请输入arp账号");
    //     return
    // }
    // if (!!!this.myForm.value.vpnPwd) {
    //     this.NativeService.showToast("请输入arp密码");
    //     return
    // }


    // this.NativeService.loginVpn('159.226.99.57', 443, this.myForm.value.vpnNumber, this.myForm.value.vpnPwd).then(async result => {
    //     console.log(result);
    this.login()
    // }, error => {
    //     this.NativeService.showToast("VPN账号或密码错误");
    // })

  }
  //科技网通行证登录
  logInArp = _.throttle(function () {
    if (!!!this.myArpForm.value.arpNumber) {
      this.NativeService.showToast("请输入账号");
      return
    }
    if (!!!this.myArpForm.value.arpPwd) {
      this.NativeService.showToast("请输入密码");
      return
    }
    let parmaps = {
      engName: this.myArpForm.value.arpNumber,
      userPsw: this.myArpForm.value.arpPwd
    };
    //避免重复点击，重复登录问题
    this.clickStatus = false;
    this.NativeService.showLoading();
    this.http.post(ENV.httpurl + "/api/escienceAuth/appEscienceAuthLogin", parmaps).timeout(9000).subscribe(async data => {
      this.clickStatus = true;
      this.NativeService.hideLoading();
      if (data['status'] == 'FALSE') {
        if (!!data['message']) {
          this.NativeService.showToast(data['message']);
          return false;
        } else {
          this.NativeService.showToast('未知错误，请联系管理员');
          return false;
        }
      }
      if (!!data['token']) {
        localStorage.setItem("token", data['token'])
        localStorage.setItem("objectList", JSON.stringify(data));
        await this.helper.setTagWidthAlias(data['staff'].userId);

        //判断是否记住密码
        if (this.remember) {
          localStorage.setItem('remember', JSON.stringify({ 'c': this.myArpForm.value.arpNumber, 'd': this.myArpForm.value.arpPwd }));
        } else {
          localStorage.removeItem('remember');
        }
        this.navCtrl.push(TabsPage);
      } else {
        this.NativeService.showToast(data['message']);
      }
    }, error => {
      this.NativeService.hideLoading();
      this.clickStatus = true;
      // this.NativeService.showAlert(error);
    });
  }, 800);
  login() {
    let parmaps = {
      loginCode: this.myForm.value.loginCode,
      userPsw: this.myForm.value.userPsw,
      identityingCode: this.myForm.value.validcode,
    }
    this.NativeService.showLoading();
    //避免重复点击，重复登录问题
    this.clickStatus = false;
    let pa = { loginCode: "yuanwei", userPsw: "000000", identityingCode: "" }
    // this.http.post(ENV.httpurlscm + "/api/login/login", parmaps).subscribe(async data => {
    this.http.post(ENV.httpurl + "/api/login/loginApp", parmaps).timeout(9000).subscribe(async data => {
      this.clickStatus = true;
      this.NativeService.hideLoading();
      if (data['errorCode'] == 'keyPasswordError') {
        this.NativeService.showToast(data['message']);
        if (data['showVCode'] == true) {
          this.NativeService.showToast('请输入验证码');
          this.showcode = true;
          let that = this;
          setTimeout(function () {
            that.drawPic();
          }, 10);
          return false;
        }
        return false;
      } else if (data['errorCode'] == 'outOfCorpDept') {
        this.NativeService.showToast(data['message']);
        return false;
      }
      if (!!data['token']) {
        this.http.get(ENV.httpurlscm + '/api/role/queryRolesByUserId/' + data['staff'].userId).subscribe(async resp => {
          localStorage.setItem("cgObjectList", JSON.stringify(resp));
          localStorage.setItem("token", data['token'])
          localStorage.setItem("objectList", JSON.stringify(data));
          await this.helper.setTagWidthAlias(data['staff'].userId);
          //判断是否记住密码
          if (this.remember) {
            localStorage.setItem('remember', JSON.stringify({ 'a': this.myForm.value.loginCode, 'b': this.myForm.value.userPsw }));
          } else {
            localStorage.removeItem('remember');
          }
          this.navCtrl.push(TabsPage);
        })
      } else {
        this.NativeService.showToast(data['message']);
      }
    }, error => {
      this.NativeService.hideLoading();
      this.clickStatus = true;
      //  this.NativeService.showAlert(error);
    })
  }
  //登录方式切换时，因ngIf，需重新绘制验证码
  segmentChanged() {
    let that = this;
    if (that.toggle == "true") {

    } else {

    }
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
  drawPic() {
    if (!this.showcode) {
      return;
    }
    let canvas: any = document.getElementById('ValidCode1');
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

    /**绘制干扰线**/
    // for(var i=0;i<3;i++) {
    //     ctx.strokeStyle = this.randomColor(40, 180);
    //     ctx.beginPath();
    //     ctx.moveTo(this.randomNum(0,width/2), this.randomNum(0,height/2));
    //     ctx.lineTo(this.randomNum(0,width/2), this.randomNum(0,height));
    //     ctx.stroke();
    // }
    /**绘制干扰点**/
    // for(var i=0;i <50;i++) {
    //     ctx.fillStyle = this.randomColor(255,0);
    //     ctx.beginPath();
    //     ctx.arc(this.randomNum(0, width), this.randomNum(0, height),1,0,2* Math.PI);
    //     ctx.fill();
    // }
    return this.code;
  }

  changePwd(e) {
    let pw: any = document.getElementById('password').getElementsByTagName('input')[0];
    let yanjing = document.getElementById('login_icon_yanjing');
    if (pw.getAttribute('type') == "password") {
      pw.setAttribute('type', "text");
      yanjing.className = yanjing.className.replace('icon-biyan', 'icon-yanjing');
    } else {
      pw.setAttribute('type', "password");
      yanjing.className = yanjing.className.replace('icon-yanjing', 'icon-biyan');
    }
  }

  //忘记密码
  forgetpwd() {
    this.navCtrl.push('ForgetpwdPage');
  }

}
