import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,AlertController,App,Events } from 'ionic-angular';
import { ChangepwdPage } from './changepwd/changepwd';
import { globalData } from '../../../icommon/provider/globalData';
import { NativeService } from '../../../icommon/provider/native';
import { HttpClient } from '@angular/common/http';
import { ENV } from '@env/environment';
import { LoginPage } from '../../../pages/login/login';
import { InformationPage } from './information/information';
// import { LoginLogPage } from './login-log/login-log';
@IonicPage()
@Component({
  selector: 'page-setting',
  templateUrl: 'setting.html',
})
export class SettingPage {
  items = [];
  userinfo:any={};
  userinforList:any;
  httpurl:any = ENV.httpurl;
  gender:any;
  version:any;
  constructor(private events: Events,public navCtrl: NavController, public navParams: NavParams,private alerCtrl: AlertController,
     public globalData: globalData,public NativeService: NativeService,public http: HttpClient, private app: App) {
    this.userinforList= JSON.parse(localStorage.getItem("objectList"));
    this.userinfo.logo="http://img.zcool.cn/community/0117e2571b8b246ac72538120dd8a4.jpg@1280w_1l_2o_100sh.jpg";
    this.userinfo.username=this.userinforList.staff.userName;
    this.userinfo.userId=this.userinforList.staff.mobile;
    this.userinfo.picture=this.userinforList.staff.photo;
    this.gender = this.userinforList.staff.gender?this.userinforList.staff.gender:"M";
    this.items = [
      {
        'title': '个人信息',
        'icon': 'userhead',
      },
      {
        'title': '修改密码',
        'icon': 'lock',
      },
      {
        'title': '通知设置',
        'icon': 'tongzhi',
      },
    ]
  }
  ionViewDidEnter() {
    this.events.publish('tabs:slide0', 'slide0');
    this.userinforList= JSON.parse(localStorage.getItem("objectList"));
    this.userinfo.picture=this.userinforList.staff.photo;
    this.getversion();
  }
  openNavDetailsPage(item) {
    if(item =="修改密码"){
      this.navCtrl.push(ChangepwdPage);
    }else if(item =="通知设置"){
      this.navCtrl.push('LoginLogPage');
    }else if(item =="个人信息"){
      this.navCtrl.push(InformationPage);
      }else if(item =='意见反馈'){
           this.navCtrl.push('FeedBackPage');
      }
  }
  goback(){
    this.navCtrl.pop();
  }
  drop(){
    this.showAlert();
  }
  async showAlert() {
    let confirm = this.alerCtrl.create({
      title: "确定退出吗？",
      message:"",
      buttons: [
        {
          text: '取消',
          handler: () => {
          }
        },
        {
          text: '确定',
          handler: () => {
            this.quit();
          }
        }
      ]
    });
    await confirm.present();
  }
  quit(){
    this.http.post(ENV.httpurl + "/api/login/loginOut",null).subscribe(data => {
      // this.globalData=null;
      let remember = localStorage['remember'];
      localStorage.clear();
      //退出时，不清空记住密码;
      localStorage.setItem('remember',remember);
      // this.navCtrl.push(LoginPage); -- ionic3 多层返回至登录页面问题、退出登录直接返回登录页面
      this.app.getRootNav().setRoot(LoginPage);
    })
  }
  ionViewDidLoad() {
  }

  getversion() {
    if (this.NativeService.isMobile()) {
      this.NativeService.getVersionNumber().then(res => {
        if (!!!!res) {
          this.version = res;
        }
      });
    }else{
      // this.version='1.0.0';
    }

  }

}
