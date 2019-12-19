/**
 * Created by shenqingqing on 2018/9/28.
 */
import { Injectable } from "@angular/core";
import { Toast } from "@ionic-native/toast";
import { Camera, CameraOptions } from "@ionic-native/camera";
import { Observable } from "rxjs";
import { IMAGE_SIZE, QUALITY_SIZE } from "./Constants";
import { HttpClient } from "@angular/common/http";
import { File, FileEntry } from "@ionic-native/file";
import { ImagePicker } from "@ionic-native/image-picker";
import {
  ToastController,
  Platform,
  AlertController,
  Loading,
  LoadingController
} from "ionic-angular";
// import { DatePipe } from '@angular/common';
// import { AppUpdate } from '@ionic-native/app-update';
import { AppVersion } from "@ionic-native/app-version";
import { InAppBrowser } from "@ionic-native/in-app-browser";
import { Network } from "@ionic-native/network";
import { ENV } from "@env/environment";
declare var SangforCordovaPlugin;
@Injectable()
export class NativeService {
  private loading: Loading;
  constructor(
    private toast: Toast,
    private file: File,
    private camera: Camera,
    public http: HttpClient,
    private imagePicker: ImagePicker,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private platform: Platform,
    private network: Network,
    private alerCtrl: AlertController,
    private inAppBrowser: InAppBrowser,
    private appVersion: AppVersion //,private appUpdate: AppUpdate
  ) { }
  /**
   * 是否真机环境
   */
  isMobile(): boolean {
    return this.platform.is("mobile");
  }

  /**
   * 是否android真机环境
   */
  isAndroid(): boolean {
    return this.isMobile() && this.platform.is("android");
  }

  /**
   * 是否ios真机环境
   */
  isIos(): boolean {
    return (
      this.isMobile() &&
      (this.platform.is("ios") ||
        this.platform.is("ipad") ||
        this.platform.is("iphone"))
    );
  }
  // 弹出框
  async showAlert(
    header: string,
    subHeader: string = "",
    message: string = "",
    cb = null
  ) {
    let alert = await this.alerCtrl.create({
      title: header,
      subTitle: subHeader,
      buttons: [
        {
          text: "确定",
          handler: () => {
            cb && cb();
          }
        }
      ]
    });
    await alert.present();
  }
  /**
   * 统一调用此方法显示提示信息
   * @param message 信息内容
   * @param duration 显示时长
   */
  async showToast(message: string = "操作完成", duration: number = 800) {
    // if (this.isMobile()) {
    //     this.toast.show(message, String(duration), 'center').subscribe();
    // } else {
    let toast = await this.toastCtrl.create({
      message: message,
      duration: duration,
      position: "middle"
    });
    toast.present();
    // }
  }
  /**
   * 统一调用此方法显示loading
   * @param content 显示的内容
   * 使用方法----this.NativeService.showLoading()
   */
  showLoading(content = ""): void {
    if (this.loading) {
      // 如果loading已经存在则不再打开
      return;
    }
    const loading = this.loadingCtrl.create({
      content,
      spinner: "crescent"
    });
    loading.present();
    this.loading = loading;
  }

  /**
   * 关闭loading
   * 使用方法----this.NativeService.hideLoading()
   */
  hideLoading(): void {
    this.loading && this.loading.dismiss();
    this.loading = null;
  }
  /**
   * 日程模块，时间显示形式调用方法
   * 使用方法 --- this.NativeService.timeMethod()
   */
  timeMethod(startDate, closeDate) {
    let start = new Date(startDate);
    let close = new Date(closeDate);
    if (start && close) {
      let startyear = start.getFullYear() + "年";
      let closeyear = close.getFullYear() + "年";
      let startMonth = start.getMonth() + 1 + "月";
      let closeMonth = close.getMonth() + 1 + "月";
      let startday = start.getDate() + "日";
      let closetday = close.getDate() + "日";

      if (startyear === closeyear) {
        closeyear = "";
        if (startMonth === closeMonth) {
          closeMonth = "";
          if (startday === closetday) {
            closetday = "";
          }
        }
      }
      let startN = startyear + startMonth + startday;
      let closeN = closeyear + closeMonth + closetday;
      return startN + (!!closeN ? "至" + closeN : "");
    }
  }
  /**
   * 动态获取id
   */
  uuid() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return (
      s4() +
      s4() +
      "-" +
      s4() +
      "-" +
      s4() +
      "-" +
      s4() +
      "-" +
      s4() +
      s4() +
      s4()
    );
  }
  /**
   * 使用cordova-plugin-camera获取照片
   * @param options
   */
  getPicture(options: CameraOptions = {}): Observable<string> {
    const ops: CameraOptions = {
      sourceType: this.camera.PictureSourceType.CAMERA, // 图片来源,CAMERA:拍照,PHOTOLIBRARY:相册
      destinationType: this.camera.DestinationType.FILE_URI, // 默认返回图片路径：DATA_URL:base64字符串，FILE_URI:图片路径
      quality: QUALITY_SIZE, // 图像质量，范围为0 - 100
      allowEdit: false, // 选择图片前是否允许编辑
      encodingType: this.camera.EncodingType.JPEG,
      targetWidth: IMAGE_SIZE, // 缩放图像的宽度（像素）
      targetHeight: IMAGE_SIZE, // 缩放图像的高度（像素）
      saveToPhotoAlbum: false, // 是否保存到相册
      correctOrientation: true,
      ...options
    };
    return Observable.create(observer => {
      if (this.isMobile()) {
        this.camera
          .getPicture(ops)
          .then((imgData: string) => {
            if (ops.destinationType === this.camera.DestinationType.DATA_URL) {
              observer.next("data:image/jpg;base64," + imgData);
            } else {
              observer.next(imgData);
            }
          })
          .catch(err => {
            if (err == 20) {
              this.showAlert("没有权限,请在设置中开启权限");
            } else if (String(err).indexOf("cancel") != -1) {
            } else {
              this.showAlert("获取照片失败");
            }
            observer.error(false);
          });
      } else {
        this.showAlert("请在真机上调用");
      }
    });
  }
  /**
   * 通过图库选择多图
   * @param options
   */
  getMultiplePicture(options = {}): Observable<any> {
    const that = this;
    const ops = {
      maximumImagesCount: 1,
      width: IMAGE_SIZE, // 缩放图像的宽度（像素）
      height: IMAGE_SIZE, // 缩放图像的高度（像素）
      quality: QUALITY_SIZE,
      ...options
    };
    return Observable.create(observer => {
      this.imagePicker
        .getPictures(ops)
        .then(files => {
          const destinationType = options["destinationType"] || 0; // 0:base64字符串,1:图片url
          if (destinationType === 0) {
            observer.next(files);
          } else {
            const imgBase64s = []; // base64字符串数组
            for (const fileUrl of files) {
              that.convertImgToBase64(fileUrl).subscribe(base64 => {
                imgBase64s.push(base64);
                if (imgBase64s.length === files.length) {
                  observer.next(imgBase64s);
                }
              });
            }
          }
        })
        .catch(err => {
          this.showAlert("获取照片失败");
          observer.error(false);
        });
    });
  }
  /**
   * 根据图片绝对路径转化为base64字符串
   * @param path 绝对路径
   */
  convertImgToBase64(path: string): Observable<string> {
    return Observable.create(observer => {
      this.file
        .resolveLocalFilesystemUrl(path)
        .then((fileEnter: FileEntry) => {
          fileEnter.file(file => {
            const reader = new FileReader();
            reader.onloadend = function (e) {
              observer.next(this.result);
            };
            reader.readAsDataURL(file);
          });
        })
        .catch(err => {
          observer.error(false);
        });
    });
  }
  /**
   * 判断是否有网络
   */
  isConnecting(): boolean {
    return this.getNetworkType() !== "none";
  }

  /**
   * 获取网络类型 如`unknown`, `ethernet`, `wifi`, `2g`, `3g`, `4g`, `cellular`, `none`
   */
  getNetworkType(): string {
    if (!this.isMobile()) {
      return "wifi";
    }
    return this.network.type;
  }

  /**
   * 获取当前时间或定义时间，带格式化
   * @param format 格式化,严格大小写区分,格式参考默认，默认yyyy-MM-dd HH:mm:ss
   */
  getDateNow(format = "yyyy-MM-dd HH:mm:ss") {
    // let date = new Date(new Date().getTime()+8*60*60*1000).toISOString().replace(/T/g,' ').replace(/\.[\d]{3}Z/,'');
    // return '';//this.datePipe.transform(date,format);
  }

  /**
   * 检查app是否需要升级
   */
  detectionUpgrade() {
    // if (this.isMobile()) {
    //   //模拟请求后台接口,以实际接口为准
    //   // this.http.post(ENV.httpurl + '/api/app/queryVersion', { 'appName': 'blqyTestApp' }).subscribe(data => {
    //   this.http
    //     .post(ENV.httpurl + "/api/app/queryVersion", {
    //       appName: ENV.appUpdateName
    //     })
    //     .subscribe(
    //       data => {
    //         if (!!!!data && !!!!data["version"]) {
    //           this.getVersionNumber().then(res => {
    //             if (!!!!res) {
    //               if (res != data["version"]) {
    //                 this.appUpgrade();
    //               }
    //             }
    //           });
    //         }
    //       }
    //       // ,error =>{
    //       //     this.showAlert('获取APP版本号失败');
    //       // }
    //     );
    // }
  }

  /**
   * 获得app版本号,如0.01
   * @description  对应/config.xml中version的值
   * @returns {Promise<string>}
   */
  getVersionNumber(): Promise<string> {
    return new Promise(resolve => {
      this.appVersion
        .getVersionNumber()
        .then((value: string) => {
          resolve(value);
        })
        .catch(err => { });
    });
  }

  /**
   * 提示是否需要下载最新版本
   */
  appUpgrade() {
    this.alerCtrl
      .create({
        title: "发现新版本",
        // subTitle: "检查到新版本，是否立即下载？",
        subTitle: "检查到新版本，请立即下载更新！",
        enableBackdropDismiss: false,
        buttons: [
          // { text: "取消" },
          {
            text: "下载",
            handler: () => {
              //跳转ios及android 版本下载地址
              // this.inAppBrowser.create('https://app.qysoft.cn/blqyApp/index.html', '_system');//qysoft
              // this.inAppBrowser.create('https://app.qysoft.cn/blqyTestApp/index.html', '_system');//aicas
              // this.inAppBrowser.create('https://app.qysoft.cn/iapApp/index.html', '_system');     // 大气所
              // this.inAppBrowser.create('https://app.qysoft.cn/iozApp/index.html', '_system');     // 动物所
              this.inAppBrowser.create(ENV.appUpdateUrl, "_system"); // 动物所
            }
          }
        ]
      })
      .present();
  }
  /**
   * VPN登录
   */
  loginVpn(ip, num, vpn_no, vpn_pas) {
    return new Promise((resolve, reject) => {
      if (this.isMobile()) {
        SangforCordovaPlugin.login(ip, num, vpn_no, vpn_pas).then(
          function (result) {
            console.log("vpn ok result:" + result);
            resolve(result);
          },
          function (error) {
            if (error === "already loged") {
              resolve("already loged");
            } else {
              console.log("VPN登录失败r:" + error);
              reject(+error);
            }
          }
        );
      } else {
        resolve("网站登录方式不需要VPN信息");
      }
    });
  }
  /**
   * 退出登录
   */
  logout() {
    let remember = localStorage["remember"];
    localStorage.clear();
    //退出时，不清空记住密码;
    localStorage.setItem("remember", remember);
    // TODO 登出 VPN
    return new Promise((resolve, reject) => {
      if (this.isMobile()) {
        SangforCordovaPlugin.logout().then(
          function (result) {
            console.log("vpn ok result:" + result);
            resolve(result);
          },
          function (error) {
            resolve(error);
          }
        );
      } else {
        resolve("网站登录方式不需要VPN信息");
      }
    });
  }
}
