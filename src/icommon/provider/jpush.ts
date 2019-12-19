
/**
 * Created by shenqingqing on 2018-10-23.
 */
import { NativeService } from './native';
import { Injectable } from '@angular/core';
import { JPush } from '@jiguang-ionic/jpush';
import { Events } from 'ionic-angular';
import { ENV } from '@env/environment';
import { HttpClient } from '@angular/common/http';

/**
 * @description
 */
@Injectable()
export class Helper {
    loginObj:any;
    constructor(private jPush: JPush,
        private  http: HttpClient,
        private nativeService:NativeService,
        private events: Events) {
        this.loginObj = JSON.parse(localStorage.getItem("objectList"));
        
    }
  /**
   * 极光推送
   */
  initJpush() {
    if (!this.nativeService.isMobile()) {
      return;
    }
    this.jPush.init().then(data =>{
        // this.nativeService.showAlert("极光初始化成功")
    }).catch(error =>{
        // this.nativeService.showAlert("极光初始化失败")
    })
    this.jPush.setDebugMode(true);
    this.jPushAddEventListener();
  }
 
  // 详细文档 https://github.com/jpush/jpush-phonegap-plugin/blob/master/doc/Common_detail_api.md
  private jPushAddEventListener() {
    this.jPush.getUserNotificationSettings().then(result => {
      if (result == 0) {
        console.log('jpush-系统设置中已关闭应用推送');
      } else if (result > 0) {
        console.log('jpush-系统设置中打开了应用推送');
      }
    });
    document.addEventListener('jpush.receiveRegistrationId', event => {
        console.log(event)
    }, false);
    // 点击通知进入应用程序时会触发的事件
    document.addEventListener('jpush.openNotification', event => {
      this.setIosIconBadgeNumber(0);
      const content = this.nativeService.isIos() ? event['aps'].alert : event['alert'];
      console.log('jpush.openNotification' + content);
      this.events.publish('jpush.openNotification', content);
    }, false);

    // 收到通知时会触发该事件
    document.addEventListener('jpush.receiveNotification', event => {
      const content = this.nativeService.isIos() ? event['aps'].alert : event['alert'];
      console.log('jpush.receiveNotification' + content);
    }, false);

    // 收到自定义消息时触发这个事件
    document.addEventListener('jpush.receiveMessage', event => {
      const message = this.nativeService.isIos() ? event['content'] : event['message'];
      console.log('jpush.receiveMessage' + message);
    }, false);

  }
  // 打别名标签
  setTagWidthAlias(userId){
    this.jPush.getRegistrationID().then(data =>{
        console.log("设备Id"+data);
        // 别名 hp+设备Id
        // 标签 hp+用户Id
        let alias = "hp" + data;
        let tags = [ "hp" + userId];
        let parmas={
            registrationID: data,
            alias: alias,
            tags: tags,
            userId : userId,
            platform: this.nativeService.isIos() ? 'ios' : 'android', //1是ios,2是Android
        }
        this.http.post(ENV.httpurl + '/api/jpush/saveJPushRegistration', parmas).subscribe(result =>{
          console.log(result);
            // this.nativeService.showAlert("接口成功");
        },error =>{
            console.log(error.error);
            // this.nativeService.showAlert("接口失败");
        })
        this.setAlias(alias);
        this.setTags(tags);
    }).catch(error =>{
        // this.nativeService.showAlert(error);
        console.log(error)
    })
  }
  /* 设置别名*/
  setAlias(alias) {
    if (!this.nativeService.isMobile()) {
      return;
    }
    this.jPush.setAlias({sequence: 1, alias: alias}).then(result => {
      console.log('jpush-设置别名成功:');
      console.log(result);
    }, error => {
      console.log('jpush-设置别名失败:', error);
    })
  }
    // 设置标签
  setTags(tags) {
    if (!this.nativeService.isMobile()) {
      return;
    }
    this.jPush.setTags({sequence: 1, tags}).then(result => {
      console.log('jpush-设置标签成功:');
      console.log(result);
    }, error => {
      console.log('jpush-设置标签失败:', error);
    })
  }
   /* 删除别名*/
  deleteAlias() {
    if (!this.nativeService.isMobile()) {
      return;
    }
    this.jPush.deleteAlias({sequence: 2}).then(result => {
      console.log('jpush-删除别名成功:');
      console.log(result);
    }, error => {
      console.log('jpush-设删除别名失败:', error);
    })
  }
   /* 删除标签*/
  deleteTags(tags: Array<string> = []) {
    if (!this.nativeService.isMobile()) {
      return;
    }
    this.jPush.deleteTags({sequence: 4, tags}).then(result => {
      console.log('jpush-删除标签成功:');
      console.log(result);
    }, error => {
      console.log('jpush-删除标签失败:', error);
    })
  }
 
  // 设置ios应用角标数量
  setIosIconBadgeNumber(badgeNumber) {
    if (this.nativeService.isIos()) {
      this.jPush.setBadge(badgeNumber); // 上传badge值到jPush服务器
      this.jPush.setApplicationIconBadgeNumber(badgeNumber); // 设置应用badge值
    }
  }

  /* tslint:enable */
}
