import { BackButtonService } from './../icommon/provider/backButton.service';
import { Component } from '@angular/core';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Platform, Events } from 'ionic-angular';
import { LoginPage } from '../pages/login/login';
import { TabsPage } from '../pages/tabs/tabs';
import { NativeService } from '../icommon/provider/native';
import { WelcomePage } from '../pages/welcome/welcome';
import { Storage } from '@ionic/storage';
import { Helper } from '../icommon/provider/jpush';
import { HttpClient } from '@angular/common/http';
import { ENV } from '@env/environment';
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: any;
  constructor(private backButtonService: BackButtonService, platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, public http: HttpClient,
    public nativeService: NativeService, public storage: Storage,
    public helper: Helper,
    private events: Events
  ) {

    platform.ready().then(() => {
      this.assertNetwork(); // 检测网络
      let hasToken = localStorage.getItem("token");
      // let hasToken = 'hClKC+5rqCq85DMxL2XK8mFHqZObzba4LS54gSgTh4k='
      let remember = JSON.parse(localStorage.getItem('remember'));
      if (hasToken != null) {
        // this.navCtrl.push(TabsPage);
        this.rootPage = TabsPage;
      } else {
        if (!!hasToken && hasToken == '1') {
          if (!!remember) {
            let parmaps = {
              engName: remember.c,
              userPsw: remember.d,
            }
            this.http.post(ENV.httpurl + "/api/escienceAuth/appEscienceAuthLogin", parmaps).subscribe(async data => {
              this.nativeService.hideLoading();
              if (data['status'] == 'FALSE') {
                if (!!data['message']) {
                  this.rootPage = LoginPage;
                  this.nativeService.showToast(data['message']);
                  return false;
                } else {
                  this.rootPage = LoginPage;
                  this.nativeService.showToast('网络错误，请刷新重试');
                  return false;
                }
              }
              if (!!data['token']) {
                console.log('333333333333333')
                localStorage.setItem("token", data['token'])
                localStorage.setItem("objectList", JSON.stringify(data));
                await this.helper.setTagWidthAlias(data['staff'].userId);

                //判断是否记住密码
                localStorage.setItem('remember', JSON.stringify({ 'c': remember.c, 'd': remember.d }));

                this.rootPage = TabsPage;
              } else {
                this.rootPage = LoginPage;
                this.nativeService.showToast(data['message']);
              }
            }, error => {
              this.rootPage = LoginPage;
              this.nativeService.hideLoading();
            });
          }
          // this.rootPage = TabsPage;
        } else {
          this.rootPage = LoginPage;
        }
      }
      statusBar.overlaysWebView(true);//android沉浸式状态栏
      statusBar.styleDefault();
      splashScreen.hide();
      this.nativeService.detectionUpgrade(); //检查更新
      this.helper.initJpush(); // 初始化极光推送
      this.jPushOpenNotification(); // 处理打开推送消息事件
    });
  }

  // 检测网络
  assertNetwork() {
    if (!this.nativeService.isConnecting()) {
      this.nativeService.showToast('未检测到网络,请连接网络', 5000);
    }
  }

  // 极光推送
  jPushOpenNotification() {
    // 当点击极光推送消息跳转到指定页面
    this.events.subscribe('jpush.openNotification', content => {
      this.helper.setIosIconBadgeNumber(0);

    });
  }
}
